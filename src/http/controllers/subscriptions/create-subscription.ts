import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { CreateSubscriptionUseCase } from "../../../use-cases/create-subscription";
import { DrizzleSubscriptionsRepository } from "../../../repositories/drizzle-subscriptions-repository";
import { DrizzleOrdersRepository } from "../../../repositories/drizzle-orders-repository";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { UnauthorizedError } from "../../../use-cases/errors/unauthorized-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

export async function createSubscription(request: FastifyRequest, reply: FastifyReply) {
  const createSubscriptionBodySchema = z.object({
    orderId: z.string().uuid("ID do pedido deve ser um UUID válido"),
    frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY"]),
  });

  try {
    const { orderId, frequency } = createSubscriptionBodySchema.parse(request.body);
    const { sub: consumerId } = getAuthenticatedUserFromRequest(request);

    // Instanciar repositórios
    const subscriptionsRepository = new DrizzleSubscriptionsRepository();
    const ordersRepository = new DrizzleOrdersRepository();

    // Instanciar use case
    const createSubscriptionUseCase = new CreateSubscriptionUseCase(
      subscriptionsRepository,
      ordersRepository
    );

    // Executar use case
    const { subscription } = await createSubscriptionUseCase.execute({
      consumerId,
      orderId,
      frequency,
    });

    return reply.status(201).send({
      message: "Assinatura criada com sucesso",
      subscription,
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