import { OrdersRepository, OrderItemWithProduct } from "../repositories/orders-repository";

interface ListPendingOrderItemsUseCaseRequest {
  producerId: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  search?: string;
  limit?: number;
  offset?: number;
}

interface ListPendingOrderItemsUseCaseResponse {
  items: OrderItemWithProduct[];
}

export class ListPendingOrderItemsUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    producerId,
    status,
    search,
    limit,
    offset,
  }: ListPendingOrderItemsUseCaseRequest): Promise<ListPendingOrderItemsUseCaseResponse> {
    const items = await this.ordersRepository.findItemsByProducerId({
      producerId,
      status,
      search,
      limit,
      offset,
    });

    return {
      items,
    };
  }
}