import type { FastifyInstance } from "fastify";
import { verifyUserRole } from "../../middlewares/verify-user-role";
import { createSubscription } from "./create-subscription";
import { listSubscriptions } from "./list-subscriptions";
import { manageSubscription } from "./manage-subscription";

export async function subscriptionsRoutes(app: FastifyInstance) {
  // Rotas que requerem role específico de consumer (todas as rotas de subscription são para consumers)
  await app.register(async function (app) {
    app.addHook("preHandler", verifyUserRole("consumer"));

    // POST /subscriptions → Criar nova assinatura (apenas consumers)
    app.post("/", createSubscription);

    // GET /subscriptions → Listar assinaturas do usuário
    app.get("/", listSubscriptions);

    // PATCH /subscriptions/:subscriptionId → Gerenciar assinatura (pause, resume, cancel)
    app.patch("/:subscriptionId", manageSubscription);
  });
};