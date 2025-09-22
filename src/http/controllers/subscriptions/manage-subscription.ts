import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ManageSubscriptionUseCase } from "../../../use-cases/manage-subscription";
import { DrizzleSubscriptionsRepository } from "../../../repositories/drizzle-subscriptions-repository";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { UnauthorizedError } from "../../../use-cases/errors/unauthorized-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

export async function manageSubscription(request: FastifyRequest, reply: FastifyReply) {
  const manageSubscriptionParamsSchema = z.object({
    subscriptionId: z.string().uuid("ID da assinatura deve ser um UUID válido"),
  });

  const manageSubscriptionBodySchema = z.object({
    action: z.enum(["pause", "resume", "cancel"]),
  });

  try {
    const { subscriptionId } = manageSubscriptionParamsSchema.parse(request.params);
    const { action } = manageSubscriptionBodySchema.parse(request.body);
    const { sub: consumerId } = getAuthenticatedUserFromRequest(request);

    // Instanciar repositório
    const subscriptionsRepository = new DrizzleSubscriptionsRepository();

    // Instanciar use case
    const manageSubscriptionUseCase = new ManageSubscriptionUseCase(subscriptionsRepository);

    // Executar use case
    await manageSubscriptionUseCase.execute({
      subscriptionId,
      consumerId,
      action,
    });

    const actionMessages = {
      pause: "pausada",
      resume: "retomada",
      cancel: "cancelada",
    };

    return reply.status(200).send({
      message: `Assinatura ${actionMessages[action]} com sucesso`,
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