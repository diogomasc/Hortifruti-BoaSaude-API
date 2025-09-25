import { OrdersRepository } from "../repositories/orders-repository";
import { ListPendingOrderItemsRequest, ListPendingOrderItemsResponse } from "../types";

// Type aliases for backward compatibility
type ListPendingOrderItemsUseCaseRequest = ListPendingOrderItemsRequest;
type ListPendingOrderItemsUseCaseResponse = ListPendingOrderItemsResponse;

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