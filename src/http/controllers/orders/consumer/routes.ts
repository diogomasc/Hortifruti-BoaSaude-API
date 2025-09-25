import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { verifyJWT } from "../../../middlewares/get-authenticated-user-from-request";
import { createOrderRoute } from "./create-order";
import { manageOrderRoute } from "./manage-order";

/**
 * Rotas específicas para consumidores (Orders - Consumer)
 *
 * Estas rotas permitem aos consumidores:
 * - Criar novos pedidos
 * - Listar seus pedidos
 * - Visualizar detalhes de pedidos específicos
 * - Gerenciar pedidos (pausar, retomar, cancelar)
 */
export const consumerOrdersRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook("onRequest", verifyJWT);

  // POST /orders → Cria um novo pedido vinculado ao usuário autenticado
  app.register(createOrderRoute, { prefix: "/" });

  // PATCH /orders/{orderId}/manage → Gerencia pedido (pausar, retomar, cancelar)
  app.register(manageOrderRoute);
};
