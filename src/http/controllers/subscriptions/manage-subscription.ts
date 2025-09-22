import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod";
import { ManageSubscriptionUseCase } from "../../../use-cases/manage-subscription";
import { DrizzleSubscriptionsRepository } from "../../../repositories/drizzle-subscriptions-repository";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { UnauthorizedError } from "../../../use-cases/errors/unauthorized-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

export const manageSubscriptionParamsSchema = z.object({
  subscriptionId: z.string().uuid("ID da assinatura deve ser um UUID válido"),
});

export const manageSubscriptionBodySchema = z.object({
  action: z.enum(["pause", "resume", "cancel"], {
    message: "Ação deve ser pause, resume ou cancel",
  }),
});

export const manageSubscriptionResponseSchema = z.object({
  200: z.object({
    message: z.string(),
  }).describe("Assinatura gerenciada com sucesso"),
  400: z.object({
    message: z.string(),
    errors: z.array(z.object({
      code: z.string(),
      expected: z.string().optional(),
      received: z.string().optional(),
      path: z.array(z.union([z.string(), z.number()])),
      message: z.string(),
    })).optional(),
  }).describe("Dados inválidos ou erro de validação"),
  401: z.object({
    message: z.string(),
  }).describe("Token de autenticação inválido ou não fornecido"),
  403: z.object({
    message: z.string(),
  }).describe("Acesso negado - usuário não autorizado"),
  404: z.object({
    message: z.string(),
  }).describe("Assinatura não encontrada"),
  500: z.object({
    message: z.string(),
  }).describe("Erro interno do servidor"),
});

export async function manageSubscription(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { subscriptionId } = request.params as z.infer<typeof manageSubscriptionParamsSchema>;
    const { action } = request.body as z.infer<typeof manageSubscriptionBodySchema>;
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

export async function manageSubscriptionPlugin(app: FastifyInstance) {
  app.patch("/:subscriptionId", manageSubscription);
}