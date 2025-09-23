import type { FastifyInstance } from "fastify";
import { createSubscription, createSubscriptionSchema } from "./create-subscription";
import { listSubscriptions, listSubscriptionsSchema } from "./list-subscriptions";
import { manageSubscription, manageSubscriptionSchema } from "./manage-subscription";

export async function subscriptionsRoutes(app: FastifyInstance) {
  app.post("/subscriptions", {
    schema: createSubscriptionSchema,
    handler: createSubscription,
  });

  app.get("/subscriptions", {
    schema: listSubscriptionsSchema,
    handler: listSubscriptions,
  });

  app.patch("/subscriptions/:subscriptionId", {
    schema: manageSubscriptionSchema,
    handler: manageSubscription,
  });
}
