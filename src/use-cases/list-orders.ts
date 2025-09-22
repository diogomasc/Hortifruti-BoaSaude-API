import { OrdersRepository, OrderWithItems } from "../repositories/orders-repository";

interface ListOrdersUseCaseRequest {
  userId: string;
  userRole: "consumer" | "producer" | "admin";
}

interface ListOrdersUseCaseResponse {
  orders: OrderWithItems[];
}

export class ListOrdersUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    userId,
    userRole,
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

    return {
      orders,
    };
  }
}