import { DrizzleOrdersRepository } from "../../repositories/drizzle-orders-repository";
import { DrizzleWalletsRepository } from "../../repositories/drizzle-wallets-repository";
import { DrizzleProductsRepository } from "../../repositories/drizzle-products-repository";
import { UpdateOrderItemStatusUseCase } from "../update-order-item-status";

export function makeUpdateOrderItemStatusUseCase() {
  const ordersRepository = new DrizzleOrdersRepository();
  const walletsRepository = new DrizzleWalletsRepository();
  const productsRepository = new DrizzleProductsRepository();
  const updateOrderItemStatusUseCase = new UpdateOrderItemStatusUseCase(
    ordersRepository,
    walletsRepository,
    productsRepository
  );

  return updateOrderItemStatusUseCase;
}