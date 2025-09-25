import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { ManageOrderUseCase } from "../../../../use-cases/manage-order";
import { DrizzleOrdersRepository } from "../../../../repositories/drizzle-orders-repository";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
import {
  orderParamsSchema,
  manageOrderBodySchema,
  manageOrderResponseSchema,
} from "../../../schemas/orders";
import { ORDER_ACTIONS, FREQUENCY } from "../../../../constants";

export const manageOrderRoute: FastifyPluginAsyncZod = async (app) => {
  app.put(
    "/:orderId/manage",
    {
      schema: {
        tags: ["Orders - Only Consumer"],
        summary: "Gerenciar pedido",
        description:
          "Permite pausar, retomar, cancelar um pedido ou atualizar sua recorrência. Apenas consumidores podem gerenciar seus próprios pedidos.",
        security: [{ bearerAuth: [] }],
        params: orderParamsSchema,
        body: manageOrderBodySchema,
        response: manageOrderResponseSchema,
      },
    },
    async (request, reply) => {
      const { orderId } = request.params;
      const { action, isRecurring, frequency, customDays } = request.body;
      const { sub: consumerId } = getAuthenticatedUserFromRequest(request);

      // Instanciar use case
      const ordersRepository = new DrizzleOrdersRepository();
      const manageOrderUseCase = new ManageOrderUseCase(ordersRepository);

      // Executar use case
      await manageOrderUseCase.execute({
        orderId,
        consumerId,
        action: action as
          | typeof ORDER_ACTIONS.PAUSE
          | typeof ORDER_ACTIONS.RESUME
          | typeof ORDER_ACTIONS.CANCEL,
        isRecurring,
        frequency: frequency as
          | typeof FREQUENCY.WEEKLY
          | typeof FREQUENCY.BIWEEKLY
          | typeof FREQUENCY.MONTHLY
          | typeof FREQUENCY.QUARTERLY,
        customDays,
      });

      // Construir mensagem detalhada baseada nas alterações
      const messages = [];

      // Adicionar mensagem da ação se executada
      if (action) {
        const actionMessages = {
          [ORDER_ACTIONS.PAUSE]: "pausado",
          [ORDER_ACTIONS.RESUME]: "retomado",
          [ORDER_ACTIONS.CANCEL]: "cancelado",
        };
        messages.push(
          `${actionMessages[action as keyof typeof actionMessages]}`
        );
      }

      // Adicionar mensagem sobre recorrência
      if (isRecurring === false) {
        messages.push("recorrência desativada");
      } else if (frequency !== undefined || customDays !== undefined) {
        if (frequency === FREQUENCY.CUSTOM && customDays) {
          messages.push(
            `frequência atualizada para personalizada (${customDays} dias)`
          );
        } else if (frequency && frequency !== FREQUENCY.CUSTOM) {
          const frequencyLabels = {
            [FREQUENCY.WEEKLY]: "semanal",
            [FREQUENCY.BIWEEKLY]: "quinzenal",
            [FREQUENCY.MONTHLY]: "mensal",
            [FREQUENCY.QUARTERLY]: "trimestral",
          };
          messages.push(
            `frequência atualizada para ${
              frequencyLabels[frequency as keyof typeof frequencyLabels]
            }`
          );
        }
      }

      const message =
        messages.length > 0
          ? `Pedido ${messages.join(" e ")} com sucesso`
          : "Pedido atualizado com sucesso";

      return reply.status(200).send({
        message,
      });
    }
  );
};
