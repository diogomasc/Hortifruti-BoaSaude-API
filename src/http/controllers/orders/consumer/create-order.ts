import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { CreateOrderUseCase } from "../../../../use-cases/create-order";
import { DrizzleOrdersRepository } from "../../../../repositories/drizzle-orders-repository";
import { DrizzleAddressesRepository } from "../../../../repositories/drizzle-addresses-repository";
import { DrizzleProductsRepository } from "../../../../repositories/drizzle-products-repository";
import { DrizzleUsersRepository } from "../../../../repositories/drizzle-users-repository";
import { ResourceNotFoundError } from "../../../../use-cases/errors/resource-not-found-error";
import { InvalidRoleError } from "../../../../use-cases/errors/invalid-role-error";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
import { createOrderBodySchema, createOrderResponseSchema } from "../../../schemas/orders";
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
        body: createOrderBodySchema,
        response: createOrderResponseSchema,
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
