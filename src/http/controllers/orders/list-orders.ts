import { FastifyRequest, FastifyReply } from "fastify";
import { ListOrdersUseCase } from "../../../use-cases/list-orders";
import { DrizzleOrdersRepository } from "../../../repositories/drizzle-orders-repository";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

export async function listOrders(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { sub: userId, role: userRole } = getAuthenticatedUserFromRequest(request);

    // Instanciar repositório
    const ordersRepository = new DrizzleOrdersRepository();

    // Instanciar use case
    const listOrdersUseCase = new ListOrdersUseCase(ordersRepository);

    // Executar use case
    const { orders } = await listOrdersUseCase.execute({
      userId,
      userRole,
    });

    return reply.status(200).send({
      orders,
    });
  } catch (error) {
    return reply.status(500).send({
      message: "Erro interno do servidor",
    });
  }
}