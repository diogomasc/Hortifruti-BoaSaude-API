import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ListSubscriptionsUseCase } from "../../../use-cases/list-subscriptions";
import { DrizzleSubscriptionsRepository } from "../../../repositories/drizzle-subscriptions-repository";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

export const listSubscriptionsResponseSchema = z.object({
  200: z.object({
    subscriptions: z.array(z.object({
      id: z.string().uuid(),
      consumerId: z.string().uuid(),
      orderId: z.string().uuid(),
      status: z.enum(["ACTIVE", "PAUSED", "CANCELLED"]),
      frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY"]),
      nextDeliveryDate: z.date(),
      createdAt: z.date(),
      updatedAt: z.date(),
      pausedAt: z.date().nullable(),
      cancelledAt: z.date().nullable(),
    })),
  }).describe("Lista de assinaturas retornada com sucesso"),
  401: z.object({
    message: z.string(),
  }).describe("Token de autenticação inválido ou não fornecido"),
  500: z.object({
    message: z.string(),
  }).describe("Erro interno do servidor"),
});

export async function listSubscriptions(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { sub: consumerId } = getAuthenticatedUserFromRequest(request);

    // Instanciar repositório
    const subscriptionsRepository = new DrizzleSubscriptionsRepository();

    // Instanciar use case
    const listSubscriptionsUseCase = new ListSubscriptionsUseCase(
      subscriptionsRepository
    );

    // Executar use case
    const { subscriptions } = await listSubscriptionsUseCase.execute({
      consumerId,
    });

    return reply.status(200).send({
      subscriptions,
    });
  } catch (error) {
    return reply.status(500).send({
      message: "Erro interno do servidor",
    });
  }
}
