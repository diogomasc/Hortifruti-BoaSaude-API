import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { verifyJWT } from "../../middlewares/get-authenticated-user-from-request";
import { createOrder, createOrderSchema } from "./create-order";
import { listOrders, listOrdersSchema } from "./list-orders";
import { getOrderById, getOrderByIdSchema } from "./get-order-by-id";
import { updateOrderStatus, updateOrderStatusSchema } from "./update-order-status";

export const ordersRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook("onRequest", verifyJWT);

  // GET /orders → Lista todos os pedidos do usuário autenticado
  app.get("/", { schema: listOrdersSchema }, listOrders);

  // POST /orders → Cria um novo pedido vinculado ao usuário autenticado
  app.post("/", { schema: createOrderSchema }, createOrder);

  // GET /orders/{orderId} → Obtém detalhes de um pedido específico
  app.get("/:orderId", { schema: getOrderByIdSchema }, getOrderById);

  // PATCH /orders/{orderId}/status → Atualiza o status de um pedido
  app.patch("/:orderId/status", { schema: updateOrderStatusSchema }, updateOrderStatus);
};