import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { UpdateOrderStatusUseCase } from "../../../use-cases/update-order-status";
import { DrizzleOrdersRepository } from "../../../repositories/drizzle-orders-repository";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";

export async function updateOrderStatus(request: FastifyRequest, reply: FastifyReply) {
  const updateOrderStatusParamsSchema = z.object({
    orderId: z.string().uuid("ID do pedido deve ser um UUID válido"),
  });

  const updateOrderStatusBodySchema = z.object({
    status: z.enum(["PENDING", "COMPLETED", "REJECTED"]),
  });

  try {
    const { orderId } = updateOrderStatusParamsSchema.parse(request.params);
    const { status } = updateOrderStatusBodySchema.parse(request.body);

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
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: "Dados inválidos",
        errors: error.issues,
      });
    }

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