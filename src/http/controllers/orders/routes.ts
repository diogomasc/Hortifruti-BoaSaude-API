import type { FastifyInstance } from "fastify";
import { verifyJWT } from "../../middlewares/get-authenticated-user-from-request";
import { verifyUserRole } from "../../middlewares/verify-user-role";
import { createOrder } from "./create-order";
import { getOrderById } from "./get-order-by-id";
import { listOrders } from "./list-orders";
import { updateOrderStatus } from "./update-order-status";

export async function ordersRoutes(app: FastifyInstance) {
  // Rotas que requerem apenas autenticação (qualquer usuário logado)
  await app.register(async function (app) {
    app.addHook("onRequest", verifyJWT);

    // GET /orders → Listar pedidos do usuário
    app.get("/", listOrders);

    // GET /orders/:orderId → Obter pedido específico por ID
    app.get("/:orderId", getOrderById);
  });

  // Rotas que requerem role específico de consumer
  await app.register(async function (app) {
    app.addHook("preHandler", verifyUserRole("consumer"));

    // POST /orders → Criar novo pedido (apenas consumers)
    app.post("/", createOrder);
  });

  // Rotas que requerem role específico de producer
  await app.register(async function (app) {
    app.addHook("preHandler", verifyUserRole("producer"));

    // PATCH /orders/:orderId/status → Atualizar status do pedido (apenas producers)
    app.patch("/:orderId/status", updateOrderStatus);
  });
};