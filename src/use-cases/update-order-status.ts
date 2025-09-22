import { OrdersRepository } from "../repositories/orders-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface UpdateOrderStatusUseCaseRequest {
  orderId: string;
  status: "PENDING" | "COMPLETED" | "REJECTED";
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

    // Atualizar o status
    await this.ordersRepository.updateStatus(orderId, status);
  }
}