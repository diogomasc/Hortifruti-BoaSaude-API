import { DrizzleOrdersRepository } from "../../repositories/drizzle-orders-repository";
import { ListPendingOrderItemsUseCase } from "../list-pending-order-items";

export function makeListPendingOrderItemsUseCase() {
  const ordersRepository = new DrizzleOrdersRepository();
  const listPendingOrderItemsUseCase = new ListPendingOrderItemsUseCase(ordersRepository);

  return listPendingOrderItemsUseCase;
}