import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { GetOrderUseCase } from "../../../../use-cases/get-order";
import { DrizzleOrdersRepository } from "../../../../repositories/drizzle-orders-repository";
import { ResourceNotFoundError } from "../../../../use-cases/errors/resource-not-found-error";
import { NotAllowedError } from "../../../../use-cases/errors/not-allowed-error";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";

// Schema para documentação Swagger
export const getOrderByIdSchema = {
  tags: ["Orders - Consumer"],
  summary: "Obter pedido por ID",
  description:
    "Obtém os detalhes de um pedido específico pelo seu ID. O usuário só pode acessar seus próprios pedidos.",
  security: [{ bearerAuth: [] }],
  params: z.object({
    orderId: z.string().uuid("ID do pedido deve ser um UUID válido"),
  }),
  response: {
    200: z
      .object({
        order: z.object({
          id: z.string().uuid(),
          consumerId: z.string().uuid(),
          deliveryAddressId: z.string().uuid(),
          totalAmount: z.string(),
          status: z.enum(["PENDING", "COMPLETED", "REJECTED"]),
          createdAt: z.date(),
          items: z.array(
            z.object({
              id: z.string().uuid(),
              productId: z.string().uuid(),
              producerId: z.string().uuid(),
              quantity: z.number(),
              unitPrice: z.string(),
              totalPrice: z.string(),
            })
          ),
        }),
      })
      .describe("Detalhes do pedido retornados com sucesso"),
    400: z
      .object({
        message: z.string(),
        errors: z
          .array(
            z.object({
              code: z.string(),
              expected: z.string().optional(),
              received: z.string().optional(),
              path: z.array(z.union([z.string(), z.number()])),
              message: z.string(),
            })
          )
          .optional(),
      })
      .describe("ID inválido ou erro de validação"),
    401: z
      .object({
        message: z.string(),
      })
      .describe("Token de autenticação inválido ou não fornecido"),
    403: z
      .object({
        message: z.string(),
      })
      .describe("Acesso negado - usuário não autorizado a acessar este pedido"),
    404: z
      .object({
        message: z.string(),
      })
      .describe("Pedido não encontrado"),
    500: z
      .object({
        message: z.string(),
      })
      .describe("Erro interno do servidor"),
  },
};

export async function getOrderById(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const params = getOrderByIdSchema.params.parse(request.params);
    const { orderId } = params;
    const { sub: userId, role: userRole } =
      getAuthenticatedUserFromRequest(request);

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

    if (error instanceof NotAllowedError) {
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
