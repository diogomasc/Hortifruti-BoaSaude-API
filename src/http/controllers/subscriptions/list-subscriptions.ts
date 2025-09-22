import { FastifyRequest, FastifyReply } from "fastify";
import { ListSubscriptionsUseCase } from "../../../use-cases/list-subscriptions";
import { DrizzleSubscriptionsRepository } from "../../../repositories/drizzle-subscriptions-repository";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

export async function listSubscriptions(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { sub: consumerId } = getAuthenticatedUserFromRequest(request);

    // Instanciar repositório
    const subscriptionsRepository = new DrizzleSubscriptionsRepository();

    // Instanciar use case
    const listSubscriptionsUseCase = new ListSubscriptionsUseCase(subscriptionsRepository);

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