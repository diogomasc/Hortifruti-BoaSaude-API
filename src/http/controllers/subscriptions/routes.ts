import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { verifyJWT } from "../../middlewares/get-authenticated-user-from-request";
import { createSubscription, createSubscriptionBodySchema, createSubscriptionResponseSchema } from "./create-subscription";
import { listSubscriptions, listSubscriptionsResponseSchema } from "./list-subscriptions";
import { manageSubscription, manageSubscriptionParamsSchema, manageSubscriptionBodySchema, manageSubscriptionResponseSchema } from "./manage-subscription";

// Schema para criar assinatura
export const createSubscriptionSchema = {
  body: createSubscriptionBodySchema,
  response: createSubscriptionResponseSchema,
};

// Schema para listar assinaturas
export const listSubscriptionsSchema = {
  response: listSubscriptionsResponseSchema,
};

// Schema para gerenciar assinatura
export const manageSubscriptionSchema = {
  params: manageSubscriptionParamsSchema,
  body: manageSubscriptionBodySchema,
  response: manageSubscriptionResponseSchema,
};

export const subscriptionsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook("onRequest", verifyJWT);

  // GET /subscriptions → Lista todas as assinaturas do usuário autenticado
  app.get("/", { schema: listSubscriptionsSchema }, listSubscriptions);

  // POST /subscriptions → Cria uma nova assinatura vinculada ao usuário autenticado
  app.post("/", { schema: createSubscriptionSchema }, createSubscription);

  // PATCH /subscriptions/{subscriptionId} → Gerencia uma assinatura (pausar, retomar, cancelar)
  app.patch("/:subscriptionId", { schema: manageSubscriptionSchema }, manageSubscription);
};
