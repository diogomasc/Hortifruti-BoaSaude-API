import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { GetOrderUseCase } from "../../../use-cases/get-order";
import { DrizzleOrdersRepository } from "../../../repositories/drizzle-orders-repository";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { UnauthorizedError } from "../../../use-cases/errors/unauthorized-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

export const getOrderParamsSchema = z.object({
  orderId: z.string().uuid("ID do pedido deve ser um UUID válido"),
});

export const getOrderResponseSchema = z.object({
  200: z.object({
    order: z.object({
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
    }),
  }).describe("Detalhes do pedido retornados com sucesso"),
  400: z.object({
    message: z.string(),
    errors: z.array(z.object({
      code: z.string(),
      expected: z.string().optional(),
      received: z.string().optional(),
      path: z.array(z.union([z.string(), z.number()])),
      message: z.string(),
    })).optional(),
  }).describe("Dados inválidos - ID do pedido inválido"),
  401: z.object({
    message: z.string(),
  }).describe("Token de autenticação inválido ou não fornecido"),
  403: z.object({
    message: z.string(),
  }).describe("Acesso negado - usuário não tem permissão para acessar este pedido"),
  404: z.object({
    message: z.string(),
  }).describe("Pedido não encontrado"),
  500: z.object({
    message: z.string(),
  }).describe("Erro interno do servidor"),
});

export async function getOrderById(request: FastifyRequest, reply: FastifyReply) {
  try {
    const params = getOrderParamsSchema.parse(request.params);
    const { orderId } = params;
    const { sub: userId, role: userRole } = getAuthenticatedUserFromRequest(request);

    // Instanciar repositório
    const ordersRepository = new DrizzleOrdersRepository();

    // Instanciar use case
    const getOrderUseCase = new GetOrderUseCase(ordersRepository);

    // Executar use case
    const { order } = await getOrderUseCase.execute({
      orderId,
      userId,
      userRole,
    });

    return reply.status(200).send({
      order,
    });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        message: error.message,
      });
    }

    if (error instanceof UnauthorizedError) {
      return reply.status(403).send({
        message: error.message,
      });
    }

    if (error instanceof Error) {
      return reply.status(400).send({
        message: error.message,
      });
    }

    return reply.status(500).send({
      message: "Erro interno do servidor",
    });
  }
}
