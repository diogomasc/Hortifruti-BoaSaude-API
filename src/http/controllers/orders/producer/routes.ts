import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { verifyJWT } from "../../../middlewares/get-authenticated-user-from-request";
import {
  updateOrderItemStatus,
  updateOrderItemStatusSchema,
} from "./update-order-item-status";
import {
  listPendingOrderItems,
  listPendingOrderItemsSchema,
} from "./list-pending-order-items";

/**
 * Rotas específicas para produtores (Orders - Producer)
 * 
 * Estas rotas permitem aos produtores:
 * - Visualizar itens de pedidos pendentes de aprovação
 * - Aprovar ou rejeitar itens específicos de pedidos
 * - Gerenciar o status dos itens de seus produtos
 */
export const producerOrdersRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook("onRequest", verifyJWT);

  // GET /orders/items/pending → Lista itens pendentes do produtor autenticado
  app.get(
    "/items/pending",
    { schema: listPendingOrderItemsSchema },
    listPendingOrderItems
  );

  // PATCH /orders/{orderId}/items/{itemId}/status → Atualiza o status de um item específico
  app.patch(
    "/:orderId/items/:itemId/status",
    { schema: updateOrderItemStatusSchema },
    updateOrderItemStatus
  );
};