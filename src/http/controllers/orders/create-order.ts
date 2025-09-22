import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { CreateOrderUseCase } from "../../../use-cases/create-order";
import { DrizzleOrdersRepository } from "../../../repositories/drizzle-orders-repository";
import { DrizzleAddressesRepository } from "../../../repositories/drizzle-addresses-repository";
import { DrizzleProductsRepository } from "../../../repositories/drizzle-products-repository";
import { DrizzleUsersRepository } from "../../../repositories/drizzle-users-repository";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { InvalidRoleError } from "../../../use-cases/errors/invalid-role-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

export async function createOrder(request: FastifyRequest, reply: FastifyReply) {
  const createOrderBodySchema = z.object({
    deliveryAddressId: z.string().uuid("ID do endereço deve ser um UUID válido"),
    items: z
      .array(
        z.object({
          productId: z.string().uuid("ID do produto deve ser um UUID válido"),
          quantity: z.number().int().positive("Quantidade deve ser um número positivo"),
        })
      )
      .min(1, "Deve haver pelo menos um item no pedido"),
  });

  try {
    const { deliveryAddressId, items } = createOrderBodySchema.parse(request.body);
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

    // Executar use case
    const { order } = await createOrderUseCase.execute({
      consumerId,
      deliveryAddressId,
      items,
    });

    return reply.status(201).send({
      message: "Pedido criado com sucesso",
      order,
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