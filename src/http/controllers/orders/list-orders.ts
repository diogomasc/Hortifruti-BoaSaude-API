import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ListOrdersUseCase } from "../../../use-cases/list-orders";
import { DrizzleOrdersRepository } from "../../../repositories/drizzle-orders-repository";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

export const listOrdersResponseSchema = z.object({
  200: z.object({
    orders: z.array(z.object({
      id: z.string().uuid(),
      consumerId: z.string().uuid(),
      deliveryAddressId: z.string().uuid(),
      totalAmount: z.string(),
      status: z.enum(["PENDING", "COMPLETED", "REJECTED"]),
      createdAt: z.date(),
      items: z.array(z.object({
        id: z.string().uuid(),
        productId: z.string().uuid(),
        producerId: z.string().uuid(),
        quantity: z.number(),
        unitPrice: z.string(),
        totalPrice: z.string(),
      })),
    })),
  }).describe("Lista de pedidos retornada com sucesso"),
  401: z.object({
    message: z.string(),
  }).describe("Token de autenticação inválido ou não fornecido"),
  500: z.object({
    message: z.string(),
  }).describe("Erro interno do servidor"),
});

export async function listOrders(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { sub: userId, role: userRole } = getAuthenticatedUserFromRequest(request);

    // Instanciar repositório
    const ordersRepository = new DrizzleOrdersRepository();

    // Instanciar use case
    const listOrdersUseCase = new ListOrdersUseCase(ordersRepository);

    // Executar use case
    const { orders } = await listOrdersUseCase.execute({
      userId,
      userRole,
    });

    return reply.status(200).send({
      orders,
    });
  } catch (error) {
    return reply.status(500).send({
      message: "Erro interno do servidor",
    });
  }
}