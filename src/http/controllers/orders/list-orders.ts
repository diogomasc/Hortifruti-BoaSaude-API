import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { ListOrdersUseCase } from "../../../use-cases/list-orders";
import { DrizzleOrdersRepository } from "../../../repositories/drizzle-orders-repository";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";
import {
  listOrdersQuerySchema,
  listOrdersResponseSchema,
} from "../../schemas/orders";
import { OrderStatus } from "../../../constants";

export const listOrdersRoute: FastifyPluginAsyncZod = async function (server) {
  server.get(
    "/",
    {
      schema: {
        tags: ["Orders"],
        summary: "Listar pedidos do usuário",
        description:
          "Lista todos os pedidos do usuário autenticado com paginação e filtros. Retorna informações completas dos pedidos incluindo itens, status e informações de recorrência.",
        security: [{ bearerAuth: [] }],
        querystring: listOrdersQuerySchema,
        response: listOrdersResponseSchema,
      },
    },
    async (request, reply) => {
      const { sub: userId, role: userRole } =
        getAuthenticatedUserFromRequest(request);

      // Extrair parâmetros de query
      const { status, search, limit, offset } = request.query;

      // Instanciar repositório
      const ordersRepository = new DrizzleOrdersRepository();

      // Instanciar use case
      const listOrdersUseCase = new ListOrdersUseCase(ordersRepository);

      // Executar use case
      const { orders, pagination } = await listOrdersUseCase.execute({
        userId,
        userRole,
        status: status as OrderStatus,
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
    }
  );
};
