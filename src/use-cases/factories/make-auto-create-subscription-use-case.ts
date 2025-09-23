import { DrizzleSubscriptionsRepository } from "../../repositories/drizzle-subscriptions-repository";
import { DrizzleOrdersRepository } from "../../repositories/drizzle-orders-repository";
import { AutoCreateSubscriptionUseCase } from "../auto-create-subscription";

export function makeAutoCreateSubscriptionUseCase() {
  const subscriptionsRepository = new DrizzleSubscriptionsRepository();
  const ordersRepository = new DrizzleOrdersRepository();
  const autoCreateSubscriptionUseCase = new AutoCreateSubscriptionUseCase(
    subscriptionsRepository,
    ordersRepository
  );

  return autoCreateSubscriptionUseCase;
}