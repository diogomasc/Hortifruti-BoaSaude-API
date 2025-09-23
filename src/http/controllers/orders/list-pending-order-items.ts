import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { makeListPendingOrderItemsUseCase } from "../../../use-cases/factories/make-list-pending-order-items-use-case";

// Schema para documentação Swagger
export const listPendingOrderItemsSchema = {
  tags: ["Orders"],
  summary: "Listar itens pendentes do produtor",
  description:
    "Lista todos os itens de pedidos que estão pendentes de aprovação/rejeição pelo produtor autenticado.",
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      items: z.array(z.object({
        id: z.string(),
        orderId: z.string(),
        productId: z.string(),
        producerId: z.string(),
        quantity: z.number(),
        unitPrice: z.string(),
        totalPrice: z.string(),
        status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
        rejectionReason: z.string().nullable(),
        updatedAt: z.string(),
        product: z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          price: z.string(),
          category: z.string(),
        }),
        order: z.object({
          id: z.string(),
          consumerId: z.string(),
          createdAt: z.string(),
        }),
      })),
    }).describe("Lista de itens pendentes do produtor"),
    401: z.object({
      message: z.string(),
    }).describe("Token de autenticação inválido ou não fornecido"),
    403: z.object({
      message: z.string(),
    }).describe("Acesso negado - apenas produtores podem acessar"),
    500: z.object({
      message: z.string(),
    }).describe("Erro interno do servidor"),
  },
};

export async function listPendingOrderItems(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Obter ID do usuário autenticado
    const producerId = request.user?.sub;
    
    if (!producerId) {
      return reply.status(401).send({ message: "Token de autenticação inválido" });
    }

    // Instanciar use case
    const listPendingOrderItemsUseCase = makeListPendingOrderItemsUseCase();

    // Executar use case
    const { items } = await listPendingOrderItemsUseCase.execute({
      producerId,
    });

    return reply.status(200).send({
      items,
    });
  } catch (error) {
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