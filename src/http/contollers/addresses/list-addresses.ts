import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeListUserAddressesUseCase } from "../../../use-cases/factories/make-list-user-addresses-use-case";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

// Schema para documentação Swagger
export const listAddressesSchema = {
  tags: ["Addresses"],
  summary: "Listar endereços do usuário",
  description:
    "Lista todos os endereços vinculados ao usuário autenticado.",
  security: [{ bearerAuth: [] }],
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

    const listUserAddressesUseCase = makeListUserAddressesUseCase();

    const { addresses } = await listUserAddressesUseCase.execute({
      userId,
    });

    return reply.status(200).send({
      addresses,
    });
  } catch (err) {
    throw err;
  }
}