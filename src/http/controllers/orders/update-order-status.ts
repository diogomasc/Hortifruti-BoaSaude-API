import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { UpdateOrderStatusUseCase } from "../../../use-cases/update-order-status";
import { DrizzleOrdersRepository } from "../../../repositories/drizzle-orders-repository";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";

export const updateOrderStatusParamsSchema = z.object({
  orderId: z.string().uuid("ID do pedido deve ser um UUID válido"),
});

export const updateOrderStatusBodySchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "REJECTED"], {
    message: "Status deve ser PENDING, COMPLETED ou REJECTED",
  }),
});

export const updateOrderStatusResponseSchema = z.object({
  200: z.object({
    message: z.string(),
  }).describe("Status do pedido atualizado com sucesso"),
  400: z.object({
    message: z.string(),
    errors: z.array(z.object({
      code: z.string(),
      expected: z.string().optional(),
      received: z.string().optional(),
      path: z.array(z.union([z.string(), z.number()])),
      message: z.string(),
    })).optional(),
  }).describe("Dados inválidos - ID do pedido ou status inválido"),
  401: z.object({
    message: z.string(),
  }).describe("Token de autenticação inválido ou não fornecido"),
  403: z.object({
    message: z.string(),
  }).describe("Acesso negado - apenas produtores podem atualizar status de pedidos"),
  404: z.object({
    message: z.string(),
  }).describe("Pedido não encontrado"),
  500: z.object({
    message: z.string(),
  }).describe("Erro interno do servidor"),
});

export async function updateOrderStatus(request: FastifyRequest, reply: FastifyReply) {
  try {
    const params = updateOrderStatusParamsSchema.parse(request.params);
    const body = updateOrderStatusBodySchema.parse(request.body);
    const { orderId } = params;
    const { status } = body;

    // Instanciar repositório
    const ordersRepository = new DrizzleOrdersRepository();

    // Instanciar use case
    const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(ordersRepository);

    // Executar use case
    await updateOrderStatusUseCase.execute({
      orderId,
      status,
    });

    return reply.status(200).send({
      message: "Status do pedido atualizado com sucesso",
    });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
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