import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { GetOrderUseCase } from "../../../use-cases/get-order";
import { DrizzleOrdersRepository } from "../../../repositories/drizzle-orders-repository";
import {
  getAuthenticatedUserFromRequest,
  verifyJWT,
} from "../../middlewares/get-authenticated-user-from-request";
import { uuidParamsSchema, errorResponseSchema } from "../../schemas/common";

export const getOrderByIdRoute: FastifyPluginAsyncZod = async function (
  server
) {
  server.addHook("onRequest", verifyJWT);
  server.get(
    "/:orderId/",
    {
      schema: {
        tags: ["Orders"],
        summary: "Obter pedido por ID",
        description:
          "Obtém os detalhes completos de um pedido específico pelo seu ID, incluindo informações de recorrência e detalhes dos itens. O usuário só pode acessar seus próprios pedidos.",
        security: [{ bearerAuth: [] }],
        params: uuidParamsSchema
          .extend({
            orderId: uuidParamsSchema.shape.id.describe(
              "ID do pedido deve ser um UUID válido"
            ),
          })
          .omit({ id: true }),
        response: {
          200: z
            .object({
              order: z.object({
                id: z.string().uuid(),
                consumerId: z.string().uuid(),
                deliveryAddressId: z.string().uuid(),
                totalAmount: z.string(),
                status: z.enum([
                  "PENDING",
                  "COMPLETED",
                  "REJECTED",
                  "PARTIALLY_COMPLETED",
                  "PAUSED",
                  "CANCELLED",
                ]),
                createdAt: z.string(),
                updatedAt: z.string(),
                completedAt: z.string().nullable(),
                // Campos de recorrência
                isRecurring: z.boolean(),
                frequency: z
                  .enum([
                    "WEEKLY",
                    "BIWEEKLY",
                    "MONTHLY",
                    "QUARTERLY",
                    "CUSTOM",
                  ])
                  .nullable(),
                customDays: z.number().nullable(),
                nextDeliveryDate: z.string().nullable(),
                pausedAt: z.string().nullable(),
                cancelledAt: z.string().nullable(),
                items: z.array(
                  z.object({
                    id: z.string().uuid(),
                    productId: z.string().uuid(),
                    producerId: z.string().uuid(),
                    quantity: z.number(),
                    unitPrice: z.string(),
                    totalPrice: z.string(),
                    status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
                    rejectionReason: z.string().nullable(),
                    updatedAt: z.string(),
                    product: z
                      .object({
                        id: z.string().uuid(),
                        title: z.string(),
                        description: z.string(),
                        price: z.string(),
                        category: z.string(),
                      })
                      .optional(),
                  })
                ),
              }),
            })
            .describe("Detalhes completos do pedido retornados com sucesso"),
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
          401: errorResponseSchema.describe(
            "Token de autenticação inválido ou não fornecido"
          ),
          403: errorResponseSchema.describe(
            "Acesso negado - usuário não autorizado a acessar este pedido"
          ),
          404: errorResponseSchema.describe("Pedido não encontrado"),
          500: errorResponseSchema.describe("Erro interno do servidor"),
        },
      },
    },
    async (request, reply) => {
      const { orderId } = request.params;
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

      // Converter datas para strings
      const formattedOrder = {
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        completedAt: order.completedAt?.toISOString() || null,
        nextDeliveryDate: order.nextDeliveryDate?.toISOString() || null,
        pausedAt: order.pausedAt?.toISOString() || null,
        cancelledAt: order.cancelledAt?.toISOString() || null,
        items: order.items.map((item) => ({
          ...item,
          updatedAt: item.updatedAt.toISOString(),
        })),
      };

      return reply.status(200).send({
        order: formattedOrder,
      });
    }
  );
};
