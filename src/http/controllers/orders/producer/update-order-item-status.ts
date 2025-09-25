import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { UpdateOrderItemStatusUseCase } from "../../../../use-cases/update-order-item-status";
import { DrizzleOrdersRepository } from "../../../../repositories/drizzle-orders-repository";
import { ResourceNotFoundError } from "../../../../use-cases/errors/resource-not-found-error";
import { NotAllowedError } from "../../../../use-cases/errors/not-allowed-error";
import { InvalidStatusTransitionError } from "../../../../use-cases/errors/invalid-status-transition-error";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
import { orderItemParamsSchema, updateOrderItemStatusBodySchema, updateOrderItemStatusResponseSchema } from "../../../schemas/orders";

export const updateOrderItemStatusRoute: FastifyPluginAsyncZod = async function (
  app
) {
  app.put(
    "/:orderId/items/:itemId/status",
    {
      schema: {
        tags: ["Orders - Only Producer"],
        summary: "Atualizar status de item do pedido",
        description:
          "Atualiza o status de um item específico do pedido. Apenas o produtor dono do item pode aprovar ou rejeitar.",
        security: [{ bearerAuth: [] }],
        params: orderItemParamsSchema,
        body: updateOrderItemStatusBodySchema,
        response: updateOrderItemStatusResponseSchema,
      },
    },
    async (request, reply) => {
  try {
    const { orderId, itemId } = request.params;
    const { status, rejectionReason } = request.body;

    // Obter ID do usuário autenticado
    const producerId = request.user?.sub;

    if (!producerId) {
      return reply
        .status(401)
        .send({ message: "Token de autenticação inválido" });
    }

    // Instanciar use case
    const ordersRepository = new DrizzleOrdersRepository();
        const updateOrderItemStatusUseCase = new UpdateOrderItemStatusUseCase(ordersRepository);

    // Executar use case
    await updateOrderItemStatusUseCase.execute({
      itemId,
      status,
      rejectionReason,
    });

    return reply.status(200).send({
      message: "Status do item atualizado com sucesso",
    });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        message: "Item do pedido não encontrado",
      });
    }

    if (error instanceof NotAllowedError) {
      return reply.status(403).send({
        message:
          "Acesso negado. Apenas o produtor dono do item pode atualizar seu status",
      });
    }

    if (error instanceof InvalidStatusTransitionError) {
      return reply.status(400).send({
        message: "Transição de status inválida. O item não está mais pendente",
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
