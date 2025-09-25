import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { ListPendingOrderItemsUseCase } from "../../../../use-cases/list-pending-order-items";
import { DrizzleOrdersRepository } from "../../../../repositories/drizzle-orders-repository";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
import { listPendingOrderItemsQuerySchema, listPendingOrderItemsResponseSchema } from "../../../schemas/orders";

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
        querystring: listPendingOrderItemsQuerySchema,
        response: listPendingOrderItemsResponseSchema,
      },
    },
    async (request, reply) => {
    // Obter ID do usuário autenticado
    const { sub: producerId } = getAuthenticatedUserFromRequest(request);

    // Extrair parâmetros de query
    const { status, search, limit, offset } = request.query as {
      status?: "PENDING" | "APPROVED" | "REJECTED";
      search?: string;
      limit: number;
      offset: number;
    };

    // Instanciar use case
    const ordersRepository = new DrizzleOrdersRepository();
        const listPendingOrderItemsUseCase = new ListPendingOrderItemsUseCase(ordersRepository);

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
    }
  );
};
