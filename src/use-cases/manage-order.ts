import { OrdersRepository } from "../repositories/orders-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UnauthorizedError } from "./errors/unauthorized-error";

interface ManageOrderUseCaseRequest {
  orderId: string;
  consumerId: string;
  action: "pause" | "resume" | "cancel";
}

export class ManageOrderUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    orderId,
    consumerId,
    action,
  }: ManageOrderUseCaseRequest): Promise<void> {
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

    // Executar a ação baseada no status atual
    switch (action) {
      case "pause":
        if (
          order.status !== "COMPLETED" &&
          order.status !== "PARTIALLY_COMPLETED"
        ) {
          throw new Error(
            "Só é possível pausar pedidos aprovados ou parcialmente aprovados"
          );
        }
        await this.ordersRepository.updateStatus(orderId, "PAUSED");
        break;

      case "resume":
        if (order.status !== "PAUSED") {
          throw new Error("Só é possível retomar pedidos pausados");
        }
        // Retorna ao status anterior baseado nos itens
        const hasRejectedItems = order.items.some(
          (item) => item.status === "REJECTED"
        );
        const hasApprovedItems = order.items.some(
          (item) => item.status === "APPROVED"
        );

        if (hasApprovedItems && hasRejectedItems) {
          await this.ordersRepository.updateStatus(
            orderId,
            "PARTIALLY_COMPLETED"
          );
        } else if (hasApprovedItems) {
          await this.ordersRepository.updateStatus(orderId, "COMPLETED");
        } else {
          await this.ordersRepository.updateStatus(orderId, "PENDING");
        }
        break;

      case "cancel":
        if (order.status === "CANCELLED") {
          throw new Error("Este pedido já foi cancelado");
        }
        if (order.status === "REJECTED") {
          throw new Error("Não é possível cancelar um pedido já rejeitado");
        }
        await this.ordersRepository.updateStatus(orderId, "CANCELLED");
        break;

      default:
        throw new Error("Ação inválida");
    }
  }
}
