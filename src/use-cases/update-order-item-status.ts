import { OrdersRepository, UpdateOrderItemStatusRequest } from "../repositories/orders-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { NotAllowedError } from "./errors/not-allowed-error";
import { InvalidStatusTransitionError } from "./errors/invalid-status-transition-error";

interface UpdateOrderItemStatusUseCaseRequest {
  itemId: string;
  producerId: string; // ID do produtor que está fazendo a atualização
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

interface UpdateOrderItemStatusUseCaseResponse {
  success: boolean;
}

export class UpdateOrderItemStatusUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    itemId,
    producerId,
    status,
    rejectionReason,
  }: UpdateOrderItemStatusUseCaseRequest): Promise<UpdateOrderItemStatusUseCaseResponse> {
    // Buscar o item do pedido
    const orderItem = await this.ordersRepository.findItemById(itemId);

    if (!orderItem) {
      throw new ResourceNotFoundError();
    }

    // Verificar se o produtor é o dono do item
    if (orderItem.producerId !== producerId) {
      throw new NotAllowedError();
    }

    // Verificar se o item ainda está pendente
    if (orderItem.status !== "PENDING") {
      throw new InvalidStatusTransitionError();
    }

    // Validar se rejectionReason é obrigatório quando status é REJECTED
    if (status === "REJECTED" && !rejectionReason) {
      throw new Error("Rejection reason is required when rejecting an item");
    }

    // Atualizar o status do item
    await this.ordersRepository.updateItemStatus({
      itemId,
      status,
      rejectionReason,
    });

    // Recalcular o status do pedido
    await this.ordersRepository.recalculateOrderStatus(orderItem.orderId);

    return {
      success: true,
    };
  }
}