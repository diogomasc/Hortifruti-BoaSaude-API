import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { CreateOrderUseCase } from "../../../use-cases/create-order";
import { DrizzleOrdersRepository } from "../../../repositories/drizzle-orders-repository";
import { DrizzleAddressesRepository } from "../../../repositories/drizzle-addresses-repository";
import { DrizzleProductsRepository } from "../../../repositories/drizzle-products-repository";
import { DrizzleUsersRepository } from "../../../repositories/drizzle-users-repository";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { InvalidRoleError } from "../../../use-cases/errors/invalid-role-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

// Schema para documentação Swagger
export const createOrderSchema = {
  tags: ["Orders"],
  summary: "Criar novo pedido",
  description:
    "Cria um novo pedido vinculado ao usuário autenticado. Apenas consumidores podem criar pedidos. Todos os produtos devem existir e ter quantidade disponível.",
  security: [{ bearerAuth: [] }],
  body: z.object({
    deliveryAddressId: z.string().uuid("ID do endereço deve ser um UUID válido"),
    items: z
      .array(
        z.object({
          productId: z.string().uuid("ID do produto deve ser um UUID válido"),
          quantity: z.number().int().positive("Quantidade deve ser um número positivo"),
        })
      )
      .min(1, "Deve haver pelo menos um item no pedido"),
  }),
  response: {
    201: z.object({
      message: z.string(),
      order: z.object({
        id: z.string().uuid(),
        consumerId: z.string().uuid(),
        deliveryAddressId: z.string().uuid(),
        totalAmount: z.string(),
        status: z.enum(["PENDING", "COMPLETED", "REJECTED"]),
        createdAt: z.date(),
        items: z.array(z.object({
          id: z.string().uuid(),
          productId: z.string().uuid(),
          quantity: z.number(),
          unitPrice: z.string(),
        })),
      }),
    }).describe("Pedido criado com sucesso"),
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
    }).describe("Acesso negado - apenas consumidores podem criar pedidos"),
    404: z.object({
      message: z.string(),
    }).describe("Recurso não encontrado (endereço ou produto)"),
    500: z.object({
      message: z.string(),
    }).describe("Erro interno do servidor"),
  },
};

export async function createOrder(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = createOrderSchema.body.parse(request.body);
    const { deliveryAddressId, items } = body;
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