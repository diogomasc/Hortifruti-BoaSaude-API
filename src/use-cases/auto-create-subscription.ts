import { SubscriptionsRepository } from "../repositories/subscriptions-repository";
import { OrdersRepository } from "../repositories/orders-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface AutoCreateSubscriptionUseCaseRequest {
  orderId: string;
}

interface AutoCreateSubscriptionUseCaseResponse {
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
  } | null;
}

export class AutoCreateSubscriptionUseCase {
  constructor(
    private subscriptionsRepository: SubscriptionsRepository,
    private ordersRepository: OrdersRepository
  ) {}

  async execute({
    orderId,
  }: AutoCreateSubscriptionUseCaseRequest): Promise<AutoCreateSubscriptionUseCaseResponse> {
    // Verificar se o pedido existe
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new ResourceNotFoundError("Pedido não encontrado");
    }

    // Só criar assinatura se o pedido estiver completado
    if (order.status !== "COMPLETED") {
      return { subscription: null };
    }

    // Verificar se já existe uma assinatura para este pedido
    const existingSubscription =
      await this.subscriptionsRepository.findByOrderId(orderId);
    if (existingSubscription) {
      return { subscription: existingSubscription };
    }

    // Usar frequência padrão WEEKLY para criação automática
    const frequency = "WEEKLY";
    const nextDeliveryDate = this.calculateNextDeliveryDate(frequency);

    // Criar a assinatura automaticamente
    const subscription = await this.subscriptionsRepository.create({
      consumerId: order.consumerId,
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