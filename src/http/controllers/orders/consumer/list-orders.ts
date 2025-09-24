import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ListOrdersUseCase } from "../../../../use-cases/list-orders";
import { DrizzleOrdersRepository } from "../../../../repositories/drizzle-orders-repository";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";

// Schema para documentação Swagger
export const listOrdersSchema = {
  tags: ["Orders - Consumer"],
  summary: "Listar pedidos do usuário",
  description:
    "Lista todos os pedidos do usuário autenticado com paginação e filtros. Retorna informações completas dos pedidos incluindo itens, status e informações de recorrência.",
  security: [{ bearerAuth: [] }],
  querystring: z.object({
    status: z.enum(["PENDING", "COMPLETED", "REJECTED", "PARTIALLY_COMPLETED", "PAUSED", "CANCELLED"]).optional(),
    search: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).default(12),
    offset: z.coerce.number().min(0).default(0),
  }),
  response: {
    200: z
      .object({
        orders: z.array(
          z.object({
            id: z.string().uuid(),
            consumerId: z.string().uuid(),
            deliveryAddressId: z.string().uuid(),
            totalAmount: z.string(),
            status: z.enum(["PENDING", "COMPLETED", "REJECTED", "PARTIALLY_COMPLETED", "PAUSED", "CANCELLED"]),
            createdAt: z.string(),
            updatedAt: z.string(),
            completedAt: z.string().nullable(),
            // Campos de recorrência
            isRecurring: z.boolean(),
            frequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "CUSTOM"]).nullable(),
            customDays: z.number().nullable(),
            nextDeliveryDate: z.string().nullable(),
            pausedAt: z.string().nullable(),
            cancelledAt: z.string().nullable(),
            items: z.array(
              z.object({
                id: z.string().uuid(),
                productId: z.string().uuid(),
                producerId: z.string().uuid(),
                quantity: z.number(),
                unitPrice: z.string(),
                totalPrice: z.string(),
                status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
                rejectionReason: z.string().nullable(),
                updatedAt: z.string(),
                product: z.object({
                  id: z.string().uuid(),
                  title: z.string(),
                  description: z.string(),
                  price: z.string(),
                  category: z.string(),
                }).optional(),
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
      .describe("Lista de pedidos com paginação retornada com sucesso"),
    401: z
      .object({
        message: z.string(),
      })
      .describe("Token de autenticação inválido ou não fornecido"),
    500: z
      .object({
        message: z.string(),
      })
      .describe("Erro interno do servidor"),
  },
};

export async function listOrders(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { sub: userId, role: userRole } =
      getAuthenticatedUserFromRequest(request);

    // Extrair parâmetros de query
    const { status, search, limit, offset } = request.query as {
      status?: "PENDING" | "COMPLETED" | "REJECTED" | "PARTIALLY_COMPLETED" | "PAUSED" | "CANCELLED";
      search?: string;
      limit: number;
      offset: number;
    };

    // Instanciar repositório
    const ordersRepository = new DrizzleOrdersRepository();

    // Instanciar use case
    const listOrdersUseCase = new ListOrdersUseCase(ordersRepository);

    // Executar use case
    const { orders, pagination } = await listOrdersUseCase.execute({
      userId,
      userRole,
      status,
      search,
      limit,
      offset,
    });

    // Converter datas para strings
    const formattedOrders = orders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      completedAt: order.completedAt?.toISOString() || null,
      nextDeliveryDate: order.nextDeliveryDate?.toISOString() || null,
      pausedAt: order.pausedAt?.toISOString() || null,
      cancelledAt: order.cancelledAt?.toISOString() || null,
      items: order.items.map((item) => ({
        ...item,
        updatedAt: item.updatedAt.toISOString(),
      })),
    }));

    return reply.status(200).send({
      orders: formattedOrders,
      pagination,
    });
  } catch (error) {
    return reply.status(500).send({
      message: "Erro interno do servidor",
    });
  }
}
