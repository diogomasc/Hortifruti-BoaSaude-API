import { OrdersRepository } from "../repositories/orders-repository";
import { AddressesRepository } from "../repositories/addresses-repository";
import { ProductsRepository } from "../repositories/products-repository";
import { UsersRepository } from "../repositories/users-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { InvalidRoleError } from "./errors/invalid-role-error";
import { CreateOrderRequest, CreateOrderResponse } from "../types";

// Type aliases for backward compatibility
type CreateOrderUseCaseRequest = CreateOrderRequest;
type CreateOrderUseCaseResponse = CreateOrderResponse;

export class CreateOrderUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private addressesRepository: AddressesRepository,
    private productsRepository: ProductsRepository,
    private usersRepository: UsersRepository
  ) {}

  async execute({
    consumerId,
    deliveryAddressId,
    items,
    isRecurring = false,
    frequency,
    customDays,
  }: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
    // Verificar se o usuário existe e é um consumidor
    const user = await this.usersRepository.findById(consumerId);
    if (!user) {
      throw new ResourceNotFoundError("Usuário não encontrado");
    }

    if (user.role !== "consumer") {
      throw new InvalidRoleError("Apenas consumidores podem criar pedidos");
    }

    // Verificar se o endereço existe e pertence ao usuário
    const address = await this.addressesRepository.findById(deliveryAddressId);
    if (!address) {
      throw new ResourceNotFoundError("Endereço de entrega não encontrado");
    }

    if (address.userId !== consumerId) {
      throw new ResourceNotFoundError(
        "Endereço de entrega não pertence ao usuário"
      );
    }

    // Verificar se todos os produtos existem e obter seus dados
    const orderItems = [];
    for (const item of items) {
      const product = await this.productsRepository.findById(item.productId);
      if (!product) {
        throw new ResourceNotFoundError(
          `Produto ${item.productId} não encontrado`
        );
      }

      if (product.quantity < item.quantity) {
        throw new Error(
          `Quantidade insuficiente para o produto ${product.title}`
        );
      }

      orderItems.push({
        productId: item.productId,
        producerId: product.producerId,
        quantity: item.quantity,
        unitPrice: parseFloat(product.price),
      });
    }

    // Calcular próxima data de entrega se for recorrente
    let nextDeliveryDate: Date | null = null;
    if (isRecurring && frequency) {
      const now = new Date();
      switch (frequency) {
        case "WEEKLY":
          nextDeliveryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case "MONTHLY":
          nextDeliveryDate = new Date(now);
          nextDeliveryDate.setMonth(now.getMonth() + 1);
          break;
        case "QUARTERLY":
          nextDeliveryDate = new Date(now);
          nextDeliveryDate.setMonth(now.getMonth() + 3);
          break;
        case "CUSTOM":
          if (customDays) {
            nextDeliveryDate = new Date(now.getTime() + customDays * 24 * 60 * 60 * 1000);
          }
          break;
      }
    }

    // Criar o pedido
    const order = await this.ordersRepository.create({
      consumerId,
      deliveryAddressId,
      items: orderItems,
      isRecurring,
      frequency,
      customDays,
    });

    return {
      order,
    };
  }
}
