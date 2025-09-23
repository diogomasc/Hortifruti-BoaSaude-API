import { OrdersRepository, OrderItemWithProduct } from "../repositories/orders-repository";

interface ListPendingOrderItemsUseCaseRequest {
  producerId: string;
}

interface ListPendingOrderItemsUseCaseResponse {
  items: OrderItemWithProduct[];
}

export class ListPendingOrderItemsUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    producerId,
  }: ListPendingOrderItemsUseCaseRequest): Promise<ListPendingOrderItemsUseCaseResponse> {
    const items = await this.ordersRepository.findPendingItemsByProducerId(producerId);

    return {
      items,
    };
  }
}