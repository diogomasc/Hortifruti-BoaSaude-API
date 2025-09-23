import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { verifyJWT } from "../../middlewares/get-authenticated-user-from-request";
import { createOrder, createOrderSchema } from "./create-order";
import { listOrders, listOrdersSchema } from "./list-orders";
import { getOrderById, getOrderByIdSchema } from "./get-order-by-id";
import {
  updateOrderItemStatus,
  updateOrderItemStatusSchema,
} from "./update-order-item-status";
import {
  listPendingOrderItems,
  listPendingOrderItemsSchema,
} from "./list-pending-order-items";
import { manageOrder, manageOrderSchema } from "./manage-order";

export const ordersRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook("onRequest", verifyJWT);

  // GET /orders → Lista todos os pedidos do usuário autenticado
  app.get("/", { schema: listOrdersSchema }, listOrders);

  // POST /orders → Cria um novo pedido vinculado ao usuário autenticado
  app.post("/", { schema: createOrderSchema }, createOrder);

  // GET /orders/{orderId} → Obtém detalhes de um pedido específico
  app.get("/:orderId", { schema: getOrderByIdSchema }, getOrderById);

  // PATCH /orders/{orderId}/items/{itemId}/status → Atualiza o status de um item específico
  app.patch(
    "/:orderId/items/:itemId/status",
    { schema: updateOrderItemStatusSchema },
    updateOrderItemStatus
  );

  // GET /orders/items/pending → Lista itens pendentes do produtor autenticado
  app.get(
    "/items/pending",
    { schema: listPendingOrderItemsSchema },
    listPendingOrderItems
  );

  // PATCH /orders/{orderId}/manage → Gerencia pedido (pausar, retomar, cancelar)
  app.patch("/:orderId/manage", { schema: manageOrderSchema }, manageOrder);
};
