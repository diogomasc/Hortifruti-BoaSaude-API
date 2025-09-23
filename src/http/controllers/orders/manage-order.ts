import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod";
import { ManageOrderUseCase } from "../../../use-cases/manage-order";
import { DrizzleOrdersRepository } from "../../../repositories/drizzle-orders-repository";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { UnauthorizedError } from "../../../use-cases/errors/unauthorized-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

// Schema para documentação Swagger
export const manageOrderSchema = {
  tags: ["Orders"],
  summary: "Gerenciar pedido",
  description:
    "Permite pausar, retomar ou cancelar um pedido. Apenas consumidores podem gerenciar seus próprios pedidos.",
  security: [{ bearerAuth: [] }],
  params: z.object({
    orderId: z.string().uuid("ID do pedido deve ser um UUID válido"),
  }),
  body: z.object({
    action: z.enum(["pause", "resume", "cancel"], {
      message: "Ação deve ser pause, resume ou cancel",
    }),
  }),
  response: {
    200: z
      .object({
        message: z.string(),
      })
      .describe("Pedido gerenciado com sucesso"),
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
      .describe("Dados inválidos ou erro de validação"),
    401: z
      .object({
        message: z.string(),
      })
      .describe("Token de autenticação inválido ou não fornecido"),
    403: z
      .object({
        message: z.string(),
      })
      .describe("Acesso negado - usuário não autorizado"),
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

export async function manageOrder(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { orderId } = request.params as z.infer<
      typeof manageOrderSchema.params
    >;
    const { action } = request.body as z.infer<typeof manageOrderSchema.body>;
    const { sub: consumerId } = getAuthenticatedUserFromRequest(request);

    // Instanciar repositório
    const ordersRepository = new DrizzleOrdersRepository();

    // Instanciar use case
    const manageOrderUseCase = new ManageOrderUseCase(ordersRepository);

    // Executar use case
    await manageOrderUseCase.execute({
      orderId,
      consumerId,
      action,
    });

    const actionMessages = {
      pause: "pausado",
      resume: "retomado",
      cancel: "cancelado",
    } as const;

    return reply.status(200).send({
      message: `Pedido ${actionMessages[action]} com sucesso`,
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

export async function manageOrderPlugin(app: FastifyInstance) {
  app.patch("/:orderId/manage", manageOrder);
}
