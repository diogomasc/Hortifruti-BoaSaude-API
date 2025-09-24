import { DrizzleOrdersRepository } from "../../repositories/drizzle-orders-repository";
import { UpdateOrderItemStatusUseCase } from "../update-order-item-status";

export function makeUpdateOrderItemStatusUseCase() {
  const ordersRepository = new DrizzleOrdersRepository();
  const updateOrderItemStatusUseCase = new UpdateOrderItemStatusUseCase(
    ordersRepository
  );

  return updateOrderItemStatusUseCase;
}