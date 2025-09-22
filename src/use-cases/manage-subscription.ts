import { SubscriptionsRepository } from "../repositories/subscriptions-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UnauthorizedError } from "./errors/unauthorized-error";

interface ManageSubscriptionUseCaseRequest {
  subscriptionId: string;
  consumerId: string;
  action: "pause" | "resume" | "cancel";
}

export class ManageSubscriptionUseCase {
  constructor(private subscriptionsRepository: SubscriptionsRepository) {}

  async execute({
    subscriptionId,
    consumerId,
    action,
  }: ManageSubscriptionUseCaseRequest): Promise<void> {
    // Verificar se a assinatura existe
    const subscription = await this.subscriptionsRepository.findById(
      subscriptionId
    );
    if (!subscription) {
      throw new ResourceNotFoundError("Assinatura não encontrada");
    }

    // Verificar se a assinatura pertence ao consumidor
    if (subscription.consumerId !== consumerId) {
      throw new UnauthorizedError(
        "Você não tem permissão para gerenciar esta assinatura"
      );
    }

    // Executar a ação baseada no status atual
    switch (action) {
      case "pause":
        if (subscription.status !== "ACTIVE") {
          throw new Error("Só é possível pausar assinaturas ativas");
        }
        await this.subscriptionsRepository.pause(subscriptionId);
        break;

      case "resume":
        if (subscription.status !== "PAUSED") {
          throw new Error("Só é possível retomar assinaturas pausadas");
        }
        await this.subscriptionsRepository.resume(subscriptionId);
        break;

      case "cancel":
        if (subscription.status === "CANCELLED") {
          throw new Error("Esta assinatura já foi cancelada");
        }
        await this.subscriptionsRepository.cancel(subscriptionId);
        break;

      default:
        throw new Error("Ação inválida");
    }
  }
}
