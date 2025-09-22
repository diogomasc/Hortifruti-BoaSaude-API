import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { verifyJWT } from "../../middlewares/get-authenticated-user-from-request";
import { createOrder, createOrderBodySchema, createOrderResponseSchema } from "./create-order";
import { listOrders, listOrdersResponseSchema } from "./list-orders";
import { getOrderById, getOrderParamsSchema, getOrderResponseSchema } from "./get-order-by-id";
import { updateOrderStatus, updateOrderStatusParamsSchema, updateOrderStatusBodySchema, updateOrderStatusResponseSchema } from "./update-order-status";

// Schema para criar pedido
export const createOrderSchema = {
  body: createOrderBodySchema,
  response: createOrderResponseSchema,
};

// Schema para listar pedidos
export const listOrdersSchema = {
  response: listOrdersResponseSchema,
};

// Schema para obter pedido por ID
export const getOrderByIdSchema = {
  params: getOrderParamsSchema,
  response: getOrderResponseSchema,
};

// Schema para atualizar status do pedido
export const updateOrderStatusSchema = {
  params: updateOrderStatusParamsSchema,
  body: updateOrderStatusBodySchema,
  response: updateOrderStatusResponseSchema,
};

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