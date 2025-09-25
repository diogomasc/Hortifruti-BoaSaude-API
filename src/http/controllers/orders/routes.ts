import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { consumerOrdersRoutes } from "./consumer/routes";
import { producerOrdersRoutes } from "./producer/routes";
import { listOrdersRoute } from "./list-orders";
import { getOrderByIdRoute } from "./get-order-by-id";

/**
 * Rotas principais de pedidos organizadas por tipo de usuário
 *
 * Esta estrutura separa as funcionalidades de pedidos em duas categorias:
 * - Consumer: Rotas para consumidores (criar, listar, visualizar, gerenciar pedidos)
 * - Producer: Rotas para produtores (aprovar/rejeitar itens, listar pendências)
 *
 * Organização:
 * - /orders/* → Rotas de consumidor
 * - /orders/* → Rotas de produtor (com contexto específico)
 */
export const ordersRoutes: FastifyPluginAsyncZod = async (app) => {
  // Registra todas as rotas de consumidor
  await app.register(consumerOrdersRoutes);

  // Registra todas as rotas de produtor
  await app.register(producerOrdersRoutes);

  // GET /orders → Lista todos os pedidos do usuário autenticado
  await app.register(listOrdersRoute);

  // GET /orders/{orderId} → Obtém detalhes de um pedido específico
  await app.register(getOrderByIdRoute);
};
