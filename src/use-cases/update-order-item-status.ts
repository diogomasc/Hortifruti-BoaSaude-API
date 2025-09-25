import {
  OrdersRepository,
  UpdateOrderItemStatusRequest as RepositoryUpdateOrderItemStatusRequest,
} from "../repositories/orders-repository";
import { WalletsRepository } from "../repositories/wallets-repository";
import { ProductsRepository } from "../repositories/products-repository";
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
  constructor(
    private ordersRepository: OrdersRepository,
    private walletsRepository: WalletsRepository,
    private productsRepository: ProductsRepository
  ) {}

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

    // Armazenar o status anterior para gerenciar estoque e carteira
    const previousStatus = orderItem.status;

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

    // Gerenciar estoque e carteira baseado na mudança de status
    const product = await this.productsRepository.findById(orderItem.productId);
    if (product) {
      // Se o item foi aprovado (e não estava aprovado antes)
      if (status === "APPROVED" && previousStatus !== "APPROVED") {
        // Creditar a carteira do produtor
        const wallet = await this.walletsRepository.findByUserId(product.producerId);
        if (wallet) {
          const itemValue = parseFloat(orderItem.unitPrice) * orderItem.quantity;
          const currentBalance = parseFloat(wallet.balance);
          const newBalance = (currentBalance + itemValue).toFixed(2);
          await this.walletsRepository.updateBalance(wallet.id, newBalance);
        }

        // Decrementar a quantidade do produto
        const newQuantity = product.quantity - orderItem.quantity;
        await this.productsRepository.updateQuantity(orderItem.productId, newQuantity);
      }
      
      // Se o item foi rejeitado (e estava aprovado antes)
      else if (status === "REJECTED" && previousStatus === "APPROVED") {
        // Debitar a carteira do produtor (reverter o crédito)
        const wallet = await this.walletsRepository.findByUserId(product.producerId);
        if (wallet) {
          const itemValue = parseFloat(orderItem.unitPrice) * orderItem.quantity;
          const currentBalance = parseFloat(wallet.balance);
          const newBalance = (currentBalance - itemValue).toFixed(2);
          await this.walletsRepository.updateBalance(wallet.id, newBalance);
        }

        // Restaurar a quantidade do produto
        const newQuantity = product.quantity + orderItem.quantity;
        await this.productsRepository.updateQuantity(orderItem.productId, newQuantity);
      }
    }

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
