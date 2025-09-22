import { SubscriptionsRepository } from "../repositories/subscriptions-repository";

interface ListSubscriptionsUseCaseRequest {
  consumerId: string;
}

interface ListSubscriptionsUseCaseResponse {
  subscriptions: {
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
  }[];
}

export class ListSubscriptionsUseCase {
  constructor(private subscriptionsRepository: SubscriptionsRepository) {}

  async execute({
    consumerId,
  }: ListSubscriptionsUseCaseRequest): Promise<ListSubscriptionsUseCaseResponse> {
    const subscriptions = await this.subscriptionsRepository.findByConsumerId(consumerId);

    return {
      subscriptions,
    };
  }
}