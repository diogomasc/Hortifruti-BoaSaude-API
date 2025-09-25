import {
  OrdersRepository,
  UpdateOrderItemStatusRequest as RepositoryUpdateOrderItemStatusRequest,
} from "../repositories/orders-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { NotAllowedError } from "./errors/not-allowed-error";
import {
  UpdateOrderItemStatusRequest,
  UpdateOrderItemStatusResponse,
} from "../types";

// Type aliases for backward compatibility
type UpdateOrderItemStatusUseCaseRequest = UpdateOrderItemStatusRequest;
type UpdateOrderItemStatusUseCaseResponse = UpdateOrderItemStatusResponse;

export class UpdateOrderItemStatusUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    itemId,
    status,
    rejectionReason,
  }: UpdateOrderItemStatusUseCaseRequest): Promise<UpdateOrderItemStatusUseCaseResponse> {
    // Buscar o item do pedido
    const orderItem = await this.ordersRepository.findItemById(itemId);

    if (!orderItem) {
      throw new ResourceNotFoundError();
    }

    // Permitir re-aprovação/re-rejeição de itens
    // Removida a validação que impedia alterar itens já aprovados/rejeitados

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

    // Nota: Pedidos recorrentes são gerenciados diretamente através dos campos de recorrência
    // Não há mais necessidade de criar assinaturas separadas

    return {
      success: true,
      message: "Status do item atualizado com sucesso",
    };
  }
}
