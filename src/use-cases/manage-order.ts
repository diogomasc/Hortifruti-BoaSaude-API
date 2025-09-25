import { OrdersRepository } from "../repositories/orders-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UnauthorizedError } from "./errors/unauthorized-error";
import { ManageOrderRequest } from "../types";
import { ORDER_STATUS, ORDER_ACTIONS, FREQUENCY, ORDER_ITEM_STATUS } from "../constants";

// Type alias for backward compatibility
type ManageOrderUseCaseRequest = ManageOrderRequest;

export class ManageOrderUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    orderId,
    consumerId,
    action,
    isRecurring,
    frequency,
    customDays,
  }: ManageOrderUseCaseRequest): Promise<void> {
    // Validar que pelo menos um campo seja fornecido
    if (!action && isRecurring === undefined && frequency === undefined && customDays === undefined) {
      throw new Error("Pelo menos um campo deve ser fornecido (action, isRecurring, frequency ou customDays)");
    }

    // Validar frequency CUSTOM
    if (frequency === FREQUENCY.CUSTOM && (customDays === undefined || customDays <= 0)) {
      throw new Error("Para frequência personalizada, customDays deve ser um número positivo");
    }

    // Verificar se o pedido existe
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new ResourceNotFoundError("Pedido não encontrado");
    }

    // Verificar se o pedido pertence ao consumidor
    if (order.consumerId !== consumerId) {
      throw new UnauthorizedError(
        "Você não tem permissão para gerenciar este pedido"
      );
    }

    // Executar ação específica se fornecida
    if (action) {
      switch (action) {
        case ORDER_ACTIONS.PAUSE:
          if (
            order.status !== ORDER_STATUS.COMPLETED &&
            order.status !== ORDER_STATUS.PARTIALLY_COMPLETED
          ) {
            throw new Error(
              "Só é possível pausar pedidos aprovados ou parcialmente aprovados"
            );
          }
          await this.ordersRepository.updateStatus(orderId, ORDER_STATUS.PAUSED);
          break;

        case ORDER_ACTIONS.RESUME:
          if (order.status !== ORDER_STATUS.PAUSED) {
            throw new Error("Só é possível retomar pedidos pausados");
          }
          // Retorna ao status anterior baseado nos itens
          const hasRejectedItems = order.items.some(
            (item) => item.status === ORDER_ITEM_STATUS.REJECTED
          );
          const hasApprovedItems = order.items.some(
            (item) => item.status === ORDER_ITEM_STATUS.APPROVED
          );

          if (hasApprovedItems && hasRejectedItems) {
            await this.ordersRepository.updateStatus(
              orderId,
              ORDER_STATUS.PARTIALLY_COMPLETED
            );
          } else if (hasApprovedItems) {
            await this.ordersRepository.updateStatus(orderId, ORDER_STATUS.COMPLETED);
          } else {
            await this.ordersRepository.updateStatus(orderId, ORDER_STATUS.PENDING);
          }
          break;

        case ORDER_ACTIONS.CANCEL:
          if (order.status === ORDER_STATUS.CANCELLED) {
            throw new Error("Este pedido já foi cancelado");
          }
          if (order.status === ORDER_STATUS.REJECTED) {
            throw new Error("Não é possível cancelar um pedido já rejeitado");
          }
          await this.ordersRepository.updateStatus(orderId, ORDER_STATUS.CANCELLED);
          break;

        default:
          throw new Error(`Ação inválida: ${action}`);
      }
    }

    // Atualizar campos de recorrência se fornecidos
    if (
      isRecurring !== undefined ||
      frequency !== undefined ||
      customDays !== undefined
    ) {
      const updateData: any = {};

      if (isRecurring !== undefined) {
        updateData.isRecurring = isRecurring;
        
        // Se isRecurring for false, definir valores padrão
        if (!isRecurring) {
          updateData.frequency = null;
          updateData.customDays = null;
        }
      }

      if (frequency !== undefined) {
        updateData.frequency = frequency;
      }

      if (customDays !== undefined) {
        updateData.customDays = customDays;
      }

      await this.ordersRepository.updateRecurrence({
        orderId,
        ...updateData,
      });
    }
  }
}
