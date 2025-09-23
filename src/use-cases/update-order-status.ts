import { OrdersRepository } from "../repositories/orders-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface UpdateOrderStatusUseCaseRequest {
  orderId: string;
  status: "PENDING" | "COMPLETED" | "REJECTED" | "PARTIALLY_COMPLETED";
}

export class UpdateOrderStatusUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({ orderId, status }: UpdateOrderStatusUseCaseRequest): Promise<void> {
    // Verificar se o pedido existe
    const order = await this.ordersRepository.findById(orderId);
    if (!order) {
      throw new ResourceNotFoundError("Pedido não encontrado");
    }

    // Validar transições de status
    if (order.status === "COMPLETED" || order.status === "REJECTED") {
      throw new Error("Não é possível alterar o status de um pedido já finalizado");
    }

    // Se o status está sendo definido manualmente, atualizar diretamente
    if (status === "REJECTED" || status === "COMPLETED") {
      await this.ordersRepository.updateStatus(orderId, status);
      return;
    }

    // Para outros casos, recalcular o status baseado nos itens
    const calculatedStatus = await this.ordersRepository.recalculateOrderStatus(orderId);
    await this.ordersRepository.updateStatus(orderId, calculatedStatus);
  }
}