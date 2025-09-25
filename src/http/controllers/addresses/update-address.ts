import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { makeUpdateAddressUseCase } from "../../../use-cases/factories/make-update-address-use-case";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

export const updateAddressRoute: FastifyPluginAsyncZod = async (server) => {
  server.put(
    "/:id",
    {
      schema: {
        tags: ["Addresses"],
        summary: "Atualizar endereço",
        description:
          "Atualiza parcialmente um endereço do usuário autenticado. Todos os campos são opcionais. Verifica se o endereço pertence ao usuário.",
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid("ID deve ser um UUID válido"),
        }),
        body: z.object({
          street: z
            .string()
            .min(1, "Rua é obrigatória")
            .optional()
            .describe("Nome da rua"),
          number: z
            .string()
            .min(1, "Número é obrigatório")
            .optional()
            .describe("Número do endereço"),
          complement: z.string().optional().describe("Complemento do endereço"),
          city: z
            .string()
            .min(1, "Cidade é obrigatória")
            .optional()
            .describe("Nome da cidade"),
          state: z
            .string()
            .min(1, "Estado é obrigatório")
            .optional()
            .describe("Nome do estado"),
          country: z
            .string()
            .min(1, "País é obrigatório")
            .optional()
            .describe("Nome do país"),
          zipCode: z
            .string()
            .regex(/^\d+$/, "CEP deve conter apenas números")
            .min(8, "CEP deve ter pelo menos 8 dígitos")
            .max(8, "CEP deve ter no máximo 8 dígitos")
            .optional()
            .describe("CEP (apenas números)"),
        }),
        response: {
          200: z.object({
            address: z.object({
              id: z.string().uuid(),
              userId: z.string().uuid(),
              street: z.string(),
              number: z.string(),
              complement: z.string().optional(),
              city: z.string(),
              state: z.string(),
              country: z.string(),
              zipCode: z.string(),
            }),
          }),
          400: z
            .object({
              message: z.string(),
            })
            .describe("Dados inválidos"),
          401: z
            .object({
              message: z.string(),
            })
            .describe("Token não fornecido ou inválido"),
          404: z
            .object({
              message: z.string(),
            })
            .describe("Endereço não encontrado ou não pertence ao usuário"),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { street, number, complement, city, state, country, zipCode } =
        request.body;

      try {
        const { sub: userId } = getAuthenticatedUserFromRequest(request);

        const updateAddressUseCase = makeUpdateAddressUseCase();

        const { address } = await updateAddressUseCase.execute({
          addressId: id,
          userId,
          street,
          number,
          complement,
          city,
          state,
          country,
          zipCode,
        });

        return reply.status(200).send({
          address,
        });
      } catch (err) {
        if (err instanceof ResourceNotFoundError) {
          return reply
            .status(404)
            .send({
              message: "Endereço não encontrado ou não pertence ao usuário",
            });
        }

        throw err;
      }
    }
  );
};
