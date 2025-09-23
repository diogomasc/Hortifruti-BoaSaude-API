import { DrizzleOrdersRepository } from "../../repositories/drizzle-orders-repository";
import { UpdateOrderItemStatusUseCase } from "../update-order-item-status";
import { makeAutoCreateSubscriptionUseCase } from "./make-auto-create-subscription-use-case";

export function makeUpdateOrderItemStatusUseCase() {
  const ordersRepository = new DrizzleOrdersRepository();
  const autoCreateSubscriptionUseCase = makeAutoCreateSubscriptionUseCase();
  const updateOrderItemStatusUseCase = new UpdateOrderItemStatusUseCase(
    ordersRepository,
    autoCreateSubscriptionUseCase
  );

  return updateOrderItemStatusUseCase;
}