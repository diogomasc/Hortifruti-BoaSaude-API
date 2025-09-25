import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeListUserAddressesUseCase } from "../../../use-cases/factories/make-list-user-addresses-use-case";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

// Schema para documentação Swagger
export const listAddressesSchema = {
  tags: ["Addresses"],
  summary: "Listar endereços do usuário",
  description:
    "Lista todos os endereços vinculados ao usuário autenticado com paginação e busca.",
  security: [{ bearerAuth: [] }],
  querystring: z.object({
    search: z.string().optional().describe("Buscar por rua, cidade, estado ou complemento"),
    limit: z.coerce.number().int().min(1).max(100).default(12).describe("Número máximo de endereços por página"),
    offset: z.coerce.number().int().min(0).default(0).describe("Número de endereços para pular"),
  }),
  response: {
    200: z.object({
      addresses: z.array(
        z.object({
          id: z.string().uuid(),
          userId: z.string().uuid(),
          street: z.string(),
          number: z.string().optional(),
          complement: z.string().optional(),
          city: z.string(),
          state: z.string(),
          country: z.string(),
          zipCode: z.string().optional(),
        })
      ),
      pagination: z.object({
        total: z.number(),
        limit: z.number(),
        offset: z.number(),
        hasNext: z.boolean(),
      }),
    }),
    401: z
      .object({
        message: z.string(),
      })
      .describe("Token não fornecido ou inválido"),
  },
};

export async function listAddresses(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { sub: userId } = getAuthenticatedUserFromRequest(request);
    const { search, limit, offset } = request.query as {
      search?: string;
      limit: number;
      offset: number;
    };

    const listUserAddressesUseCase = makeListUserAddressesUseCase();

    const { addresses, pagination } = await listUserAddressesUseCase.execute({
      userId,
      search,
      limit,
      offset,
    });

    return reply.status(200).send({
      addresses,
      pagination,
    });
  } catch (err) {
    throw err;
  }
}