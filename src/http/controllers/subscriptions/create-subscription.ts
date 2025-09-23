import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod";
import { CreateSubscriptionUseCase } from "../../../use-cases/create-subscription";
import { DrizzleSubscriptionsRepository } from "../../../repositories/drizzle-subscriptions-repository";
import { DrizzleOrdersRepository } from "../../../repositories/drizzle-orders-repository";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { UnauthorizedError } from "../../../use-cases/errors/unauthorized-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

// Schema para documentação Swagger
export const createSubscriptionSchema = {
  tags: ["Subscriptions"],
  summary: "Criar nova assinatura",
  description:
    "Cria uma nova assinatura baseada em um pedido existente. Apenas consumidores podem criar assinaturas e somente de seus próprios pedidos.",
  security: [{ bearerAuth: [] }],
  body: z.object({
    orderId: z.string().uuid("ID do pedido deve ser um UUID válido"),
    frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY"], {
      message: "Frequência deve ser WEEKLY, BIWEEKLY, MONTHLY ou QUARTERLY",
    }),
  }),
  response: {
    201: z.object({
      message: z.string(),
      subscription: z.object({
        id: z.string().uuid(),
        consumerId: z.string().uuid(),
        orderId: z.string().uuid(),
        status: z.enum(["ACTIVE", "PAUSED", "CANCELLED"]),
        frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY"]),
        nextDeliveryDate: z.date(),
        createdAt: z.date(),
        updatedAt: z.date(),
        pausedAt: z.date().nullable(),
        cancelledAt: z.date().nullable(),
      }),
    }).describe("Assinatura criada com sucesso"),
    400: z.object({
      message: z.string(),
      errors: z.array(z.object({
        code: z.string(),
        expected: z.string().optional(),
        received: z.string().optional(),
        path: z.array(z.union([z.string(), z.number()])),
        message: z.string(),
      })).optional(),
    }).describe("Dados inválidos ou erro de validação"),
    403: z.object({
      message: z.string(),
    }).describe("Acesso negado - usuário não autorizado"),
    404: z.object({
      message: z.string(),
    }).describe("Pedido não encontrado"),
    500: z.object({
      message: z.string(),
    }).describe("Erro interno do servidor"),
  },
};

export async function createSubscription(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { orderId, frequency } = request.body as z.infer<
      typeof createSubscriptionSchema.body
    >;
    const { sub: consumerId } = getAuthenticatedUserFromRequest(request);

    // Instanciar repositórios
    const subscriptionsRepository = new DrizzleSubscriptionsRepository();
    const ordersRepository = new DrizzleOrdersRepository();

    // Instanciar use case
    const createSubscriptionUseCase = new CreateSubscriptionUseCase(
      subscriptionsRepository,
      ordersRepository
    );

    // Executar use case
    const { subscription } = await createSubscriptionUseCase.execute({
      consumerId,
      orderId,
      frequency,
    });

    return reply.status(201).send({
      message: "Assinatura criada com sucesso",
      subscription,
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

export async function createSubscriptionPlugin(app: FastifyInstance) {
  app.post("/", createSubscription);
}
