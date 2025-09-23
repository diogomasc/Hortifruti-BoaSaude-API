import type { FastifyInstance } from "fastify";
import {
  createSubscription,
  createSubscriptionSchema,
} from "./create-subscription";
import {
  listSubscriptions,
  listSubscriptionsSchema,
} from "./list-subscriptions";
import {
  manageSubscription,
  manageSubscriptionSchema,
} from "./manage-subscription";

export async function subscriptionsRoutes(app: FastifyInstance) {
  app.post("/", {
    schema: createSubscriptionSchema,
    handler: createSubscription,
  });

  app.get("/", {
    schema: listSubscriptionsSchema,
    handler: listSubscriptions,
  });

  app.patch("/:subscriptionId", {
    schema: manageSubscriptionSchema,
    handler: manageSubscription,
  });
}
