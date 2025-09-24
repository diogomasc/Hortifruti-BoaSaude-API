import { OrdersRepository, OrderWithItems } from "../repositories/orders-repository";

interface ListOrdersUseCaseRequest {
  userId: string;
  userRole: "consumer" | "producer" | "admin";
  status?: "PENDING" | "COMPLETED" | "REJECTED" | "PARTIALLY_COMPLETED" | "PAUSED" | "CANCELLED";
  search?: string;
  limit?: number;
  offset?: number;
}

interface ListOrdersUseCaseResponse {
  orders: OrderWithItems[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
  };
}

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