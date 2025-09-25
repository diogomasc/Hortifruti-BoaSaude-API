import { OrdersRepository } from "../repositories/orders-repository";
import { OrderWithItems, ListOrdersRequest, ListOrdersResponse } from "../types";

// Type aliases for backward compatibility
type ListOrdersUseCaseRequest = ListOrdersRequest;
type ListOrdersUseCaseResponse = ListOrdersResponse;

export class ListOrdersUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    userId,
    userRole,
    status,
    search,
    limit = 12,
    offset = 0,
  }: ListOrdersUseCaseRequest): Promise<ListOrdersUseCaseResponse> {
    let orders: OrderWithItems[];

    if (userRole === "admin") {
      // Admin pode ver todos os pedidos
      orders = await this.ordersRepository.findAll();
    } else if (userRole === "consumer") {
      // Consumidor só pode ver seus próprios pedidos
      orders = await this.ordersRepository.findByConsumerId(userId);
    } else if (userRole === "producer") {
      // Produtor só pode ver pedidos que contenham seus produtos
      orders = await this.ordersRepository.findByProducerId(userId);
    } else {
      orders = [];
    }

    // Aplicar filtros
    if (status) {
      orders = orders.filter(order => order.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(order => 
        order.id.toLowerCase().includes(searchLower)
      );
    }

    // Calcular paginação
    const total = orders.length;
    const paginatedOrders = orders.slice(offset, offset + limit);
    const hasNext = offset + limit < total;

    return {
      orders: paginatedOrders,
      pagination: {
        total,
        limit,
        offset,
        hasNext,
      },
    };
  }
}