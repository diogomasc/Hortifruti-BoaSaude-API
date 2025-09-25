import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { CreateOrderUseCase } from "../../../../use-cases/create-order";
import { DrizzleOrdersRepository } from "../../../../repositories/drizzle-orders-repository";
import { DrizzleAddressesRepository } from "../../../../repositories/drizzle-addresses-repository";
import { DrizzleProductsRepository } from "../../../../repositories/drizzle-products-repository";
import { DrizzleUsersRepository } from "../../../../repositories/drizzle-users-repository";
import { ResourceNotFoundError } from "../../../../use-cases/errors/resource-not-found-error";
import { InvalidRoleError } from "../../../../use-cases/errors/invalid-role-error";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
// Função utilitária para normalizar dados de recorrência
function normalizeRecurrenceData(data: {
  isRecurring: boolean;
  frequency?: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "CUSTOM";
  customDays?: number;
}) {
  if (!data.isRecurring) {
    return {
      isRecurring: false,
      frequency: undefined,
      customDays: undefined,
    };
  }
  return data;
}

export const createOrderRoute: FastifyPluginAsyncZod = async function (
  app
) {
  app.post(
    "/",
    {
      schema: {
        tags: ["Orders - Only Consumer"],
        summary: "Criar novo pedido",
        description:
          "Cria um novo pedido vinculado ao usuário autenticado. Apenas consumidores podem criar pedidos. Todos os produtos devem existir e ter quantidade disponível.",
        security: [{ bearerAuth: [] }],
        body: z
          .object({
            deliveryAddressId: z
              .string()
              .uuid("ID do endereço deve ser um UUID válido"),
            items: z
              .array(
                z.object({
                  productId: z.string().uuid("ID do produto deve ser um UUID válido"),
                  quantity: z
                    .number()
                    .int()
                    .positive("Quantidade deve ser um número positivo"),
                })
              )
              .min(1, "Pelo menos um item deve ser fornecido"),
            // Campos de recorrência (usando utilitário)
            isRecurring: z.boolean(),
            frequency: z
              .enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "CUSTOM"])
              .optional(),
            customDays: z
              .number()
              .int()
              .positive("Dias personalizados deve ser um número positivo")
              .optional(),
          })
          .refine(
            (data) => {
              // Se isRecurring for true, frequency é obrigatório
              if (data.isRecurring && !data.frequency) {
                return false;
              }
              // Se frequency for CUSTOM, customDays é obrigatório
              if (data.frequency === "CUSTOM" && !data.customDays) {
                return false;
              }
              return true;
            },
            {
              message:
                "Para pedidos recorrentes, frequency é obrigatório. Para frequency CUSTOM, customDays é obrigatório.",
            }
          ),
        response: {
          201: z
            .object({
              order: z.object({
                id: z.string().uuid(),
                consumerId: z.string().uuid(),
                deliveryAddressId: z.string().uuid(),
                totalAmount: z.string(),
                status: z.enum(["PENDING", "COMPLETED", "REJECTED", "PARTIALLY_COMPLETED", "PAUSED", "CANCELLED"]),
                createdAt: z.date(),
                updatedAt: z.date(),
                completedAt: z.date().nullable(),
                isRecurring: z.boolean(),
                frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "CUSTOM"]).nullable(),
                customDays: z.number().nullable(),
                nextDeliveryDate: z.date().nullable(),
                pausedAt: z.date().nullable(),
                cancelledAt: z.date().nullable(),
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
            .describe("Pedido criado com sucesso"),
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
          403: z
            .object({
              message: z.string(),
            })
            .describe("Acesso negado - apenas consumidores podem criar pedidos"),
          404: z
            .object({
              message: z.string(),
            })
            .describe("Recurso não encontrado (endereço ou produto)"),
          500: z
            .object({
              message: z.string(),
            })
            .describe("Erro interno do servidor"),
        },
      },
    },
    async (request, reply) => {
      try {
        const { deliveryAddressId, items, isRecurring, frequency, customDays } =
          request.body;
        const { sub: consumerId } = getAuthenticatedUserFromRequest(request);

        // Instanciar repositórios
        const ordersRepository = new DrizzleOrdersRepository();
        const addressesRepository = new DrizzleAddressesRepository();
        const productsRepository = new DrizzleProductsRepository();
        const usersRepository = new DrizzleUsersRepository();

        // Instanciar use case
        const createOrderUseCase = new CreateOrderUseCase(
          ordersRepository,
          addressesRepository,
          productsRepository,
          usersRepository
        );

        // Normalizar dados de recorrência
        const normalizedRecurrence = normalizeRecurrenceData({
          isRecurring,
          frequency,
          customDays,
        });

        // Executar use case
        const { order } = await createOrderUseCase.execute({
          consumerId,
          deliveryAddressId,
          items,
          isRecurring: normalizedRecurrence.isRecurring,
          frequency: normalizedRecurrence.frequency,
          customDays: normalizedRecurrence.customDays,
        });

        return reply.status(201).send({
          order,
        });
      } catch (error) {
        if (error instanceof ResourceNotFoundError) {
          return reply.status(404).send({
            message: error.message,
          });
        }

        if (error instanceof InvalidRoleError) {
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
  );
};
