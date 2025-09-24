import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { verifyJWT } from "../../../middlewares/get-authenticated-user-from-request";
import { createOrder, createOrderSchema } from "./create-order";
import { listOrders, listOrdersSchema } from "./list-orders";
import { getOrderById, getOrderByIdSchema } from "./get-order-by-id";
import { manageOrder, manageOrderSchema } from "./manage-order";

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
  app.post("/", { schema: createOrderSchema }, createOrder);

  // GET /orders → Lista todos os pedidos do usuário autenticado
  app.get("/", { schema: listOrdersSchema }, listOrders);

  // GET /orders/{orderId} → Obtém detalhes de um pedido específico
  app.get("/:orderId", { schema: getOrderByIdSchema }, getOrderById);

  // PATCH /orders/{orderId}/manage → Gerencia pedido (pausar, retomar, cancelar)
  app.patch("/:orderId/manage", { schema: manageOrderSchema }, manageOrder);
};