import { OrdersRepository } from "../repositories/orders-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UnauthorizedError } from "./errors/unauthorized-error";

interface GetOrderUseCaseRequest {
  orderId: string;
  userId: string;
  userRole: "consumer" | "producer" | "admin";
}

interface GetOrderUseCaseResponse {
  order: {
    id: string;
    consumerId: string;
    deliveryAddressId: string;
    status:
      | "PENDING"
      | "COMPLETED"
      | "REJECTED"
      | "PARTIALLY_COMPLETED"
      | "PAUSED"
      | "CANCELLED";
    totalAmount: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date | null;
    // Campos de recorrência
    isRecurring: boolean;
    frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "CUSTOM" | null;
    customDays: number | null;
    nextDeliveryDate: Date | null;
    pausedAt: Date | null;
    cancelledAt: Date | null;
    items: {
      id: string;
      productId: string;
      producerId: string;
      quantity: number;
      unitPrice: string;
      totalPrice: string;
      status: "PENDING" | "APPROVED" | "REJECTED";
      rejectionReason: string | null;
      updatedAt: Date;
      product?: {
        id: string;
        title: string;
        description: string;
        price: string;
        category: string;
      };
    }[];
  };
}

export class GetOrderUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    orderId,
    userId,
    userRole,
  }: GetOrderUseCaseRequest): Promise<GetOrderUseCaseResponse> {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new ResourceNotFoundError("Pedido não encontrado");
    }

    // Verificar permissões de acesso
    if (userRole === "admin") {
      // Admin pode ver qualquer pedido
    } else if (userRole === "consumer") {
      // Consumidor só pode ver seus próprios pedidos
      if (order.consumerId !== userId) {
        throw new UnauthorizedError(
          "Você não tem permissão para ver este pedido"
        );
      }
    } else if (userRole === "producer") {
      // Produtor só pode ver pedidos que contenham seus produtos
      const hasProducerItems = order.items.some(
        (item) => item.producerId === userId
      );
      if (!hasProducerItems) {
        throw new UnauthorizedError(
          "Você não tem permissão para ver este pedido"
        );
      }
    }

    return {
      order,
    };
  }
}
