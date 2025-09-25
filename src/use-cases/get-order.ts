import { OrdersRepository } from "../repositories/orders-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UnauthorizedError } from "./errors/unauthorized-error";
import { GetOrderRequest, GetOrderResponse } from "../types";

// Type aliases for backward compatibility
type GetOrderUseCaseRequest = GetOrderRequest;
type GetOrderUseCaseResponse = GetOrderResponse;

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
