import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { makeListPendingOrderItemsUseCase } from "../../../../use-cases/factories/make-list-pending-order-items-use-case";

export const listPendingOrderItemsRoute: FastifyPluginAsyncZod = async function (
  app
) {
  app.get(
    "/",
    {
      schema: {
        tags: ["Orders - Only Producer"],
        summary: "Listar itens pendentes do produtor",
        description:
          "Lista todos os itens de pedidos que estão pendentes de aprovação/rejeição pelo produtor autenticado, agrupados por pedido com paginação.",
        security: [{ bearerAuth: [] }],
        querystring: z.object({
          status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
          search: z.string().optional(),
          limit: z.coerce.number().min(1).max(50).default(12),
          offset: z.coerce.number().min(0).default(0),
        }),
        response: {
          200: z
            .object({
              orders: z.array(
                z.object({
                  orderId: z.string(),
                  orderInfo: z.object({
                    id: z.string(),
                    consumerId: z.string(),
                    createdAt: z.string(),
                  }),
                  items: z.array(
                    z.object({
                      id: z.string(),
                      productId: z.string(),
                      producerId: z.string(),
                      quantity: z.number(),
                      unitPrice: z.string(),
                      totalPrice: z.string(),
                      status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
                      rejectionReason: z.string().nullable(),
                      updatedAt: z.string(),
                      product: z.object({
                        id: z.string(),
                        title: z.string(),
                        description: z.string(),
                        price: z.string(),
                        category: z.string(),
                      }),
                    })
                  ),
                })
              ),
              pagination: z.object({
                total: z.number(),
                limit: z.number(),
                offset: z.number(),
                hasNext: z.boolean(),
              }),
            })
            .describe("Lista de itens agrupados por pedido com paginação"),
          400: z
            .object({
              message: z.string(),
            })
            .describe("Dados inválidos"),
          401: z
            .object({
              message: z.string(),
            })
            .describe("Token de autenticação inválido ou não fornecido"),
          403: z
            .object({
              message: z.string(),
            })
            .describe("Acesso negado - apenas produtores podem acessar"),
          500: z
            .object({
              message: z.string(),
            })
            .describe("Erro interno do servidor"),
        },
      },
    },
    async (request, reply) => {
  try {
    // Obter ID do usuário autenticado
    const producerId = request.user?.sub;

    if (!producerId) {
      return reply
        .status(401)
        .send({ message: "Token de autenticação inválido" });
    }

    // Extrair parâmetros de query
    const { status, search, limit, offset } = request.query as {
      status?: "PENDING" | "APPROVED" | "REJECTED";
      search?: string;
      limit: number;
      offset: number;
    };

    // Instanciar use case
    const listPendingOrderItemsUseCase = makeListPendingOrderItemsUseCase();

    // Executar use case
    const { items } = await listPendingOrderItemsUseCase.execute({
      producerId,
      status,
      search,
      limit,
      offset,
    });

    // Converter datas para strings e agrupar por orderId
    const formattedItems = items.map((item) => ({
      ...item,
      updatedAt: item.updatedAt.toISOString(),
      order: {
        ...item.order,
        createdAt: item.order.createdAt.toISOString(),
      },
    }));

    // Agrupar itens por orderId
    const groupedOrders = new Map();

    formattedItems.forEach((item) => {
      const orderId = item.orderId;

      if (!groupedOrders.has(orderId)) {
        groupedOrders.set(orderId, {
          orderId,
          orderInfo: {
            id: item.order.id,
            consumerId: item.order.consumerId,
            createdAt: item.order.createdAt,
          },
          items: [],
        });
      }

      const { order, ...itemWithoutOrder } = item;
      groupedOrders.get(orderId).items.push(itemWithoutOrder);
    });

    const orders = Array.from(groupedOrders.values());

    // Calcular informações de paginação
    const total = orders.length;
    const hasNext = offset + limit < total;

    return reply.status(200).send({
      orders,
      pagination: {
        total,
        limit,
        offset,
        hasNext,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return reply.status(400).send({
        message: error.message,
      });
    }

    return reply.status(500).send({
      message: "Erro interno do servidor",
    });
  }
    }
  );
};
