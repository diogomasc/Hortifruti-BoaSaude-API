import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { GetOrderUseCase } from "../../../use-cases/get-order";
import { DrizzleOrdersRepository } from "../../../repositories/drizzle-orders-repository";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { UnauthorizedError } from "../../../use-cases/errors/unauthorized-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

export async function getOrderById(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const getOrderParamsSchema = z.object({
    orderId: z.string().uuid("ID do pedido deve ser um UUID válido"),
  });

  try {
    const { orderId } = getOrderParamsSchema.parse(request.params);
    const { sub: userId, role: userRole } = getAuthenticatedUserFromRequest(request);

    // Instanciar repositório
    const ordersRepository = new DrizzleOrdersRepository();

    // Instanciar use case
    const getOrderUseCase = new GetOrderUseCase(ordersRepository);

    // Executar use case
    const { order } = await getOrderUseCase.execute({
      orderId,
      userId,
      userRole,
    });

    return reply.status(200).send({
      order,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: "Dados inválidos",
        errors: error.issues,
      });
    }

    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        message: error.message,
      });
    }

    if (error instanceof UnauthorizedError) {
      return reply.status(403).send({
        message: error.message,
      });
    }

    return reply.status(500).send({
      message: "Erro interno do servidor",
    });
  }
}
