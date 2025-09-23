import type { FastifyInstance } from "fastify";
import {
  listSubscriptions,
  listSubscriptionsSchema,
} from "./list-subscriptions";
import {
  manageSubscription,
  manageSubscriptionSchema,
} from "./manage-subscription";

export async function subscriptionsRoutes(app: FastifyInstance) {
  app.get("/", {
    schema: listSubscriptionsSchema,
    handler: listSubscriptions,
  });

  app.patch("/:subscriptionId", {
    schema: manageSubscriptionSchema,
    handler: manageSubscription,
  });
}
