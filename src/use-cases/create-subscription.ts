import { SubscriptionsRepository } from "../repositories/subscriptions-repository";
import { OrdersRepository } from "../repositories/orders-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UnauthorizedError } from "./errors/unauthorized-error";

interface CreateSubscriptionUseCaseRequest {
  consumerId: string;
  orderId: string;
  frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY";
}

interface CreateSubscriptionUseCaseResponse {
  subscription: {
    id: string;
    consumerId: string;
    orderId: string;
    status: "ACTIVE" | "PAUSED" | "CANCELLED";
    frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY";
    nextDeliveryDate: Date;
    createdAt: Date;
    updatedAt: Date;
    pausedAt: Date | null;
    cancelledAt: Date | null;
  };
}

export class CreateSubscriptionUseCase {
  constructor(
    private subscriptionsRepository: SubscriptionsRepository,
    private ordersRepository: OrdersRepository
  ) {}

  async execute({
    consumerId,
    orderId,
    frequency,
  }: CreateSubscriptionUseCaseRequest): Promise<CreateSubscriptionUseCaseResponse> {
    // Verificar se o pedido existe
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new ResourceNotFoundError("Pedido não encontrado");
    }

    // Verificar se o pedido pertence ao consumidor
    if (order.consumerId !== consumerId) {
      throw new UnauthorizedError(
        "Você não tem permissão para criar assinatura para este pedido"
      );
    }

    // Verificar se o pedido foi completado
    if (order.status !== "COMPLETED") {
      throw new Error(
        "Só é possível criar assinatura para pedidos completados"
      );
    }

    // Verificar se já existe uma assinatura para este pedido
    const existingSubscription =
      await this.subscriptionsRepository.findByOrderId(orderId);
    if (existingSubscription) {
      throw new Error("Já existe uma assinatura para este pedido");
    }

    // Calcular a próxima data de entrega
    const nextDeliveryDate = this.calculateNextDeliveryDate(frequency);

    // Criar a assinatura
    const subscription = await this.subscriptionsRepository.create({
      consumerId,
      orderId,
      frequency,
      nextDeliveryDate,
    });

    return {
      subscription,
    };
  }

  private calculateNextDeliveryDate(
    frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY"
  ): Date {
    const now = new Date();
    const nextDate = new Date(now);

    switch (frequency) {
      case "WEEKLY":
        nextDate.setDate(now.getDate() + 7);
        break;
      case "BIWEEKLY":
        nextDate.setDate(now.getDate() + 14);
        break;
      case "MONTHLY":
        nextDate.setMonth(now.getMonth() + 1);
        break;
      case "QUARTERLY":
        nextDate.setMonth(now.getMonth() + 3);
        break;
    }

    return nextDate;
  }
}
