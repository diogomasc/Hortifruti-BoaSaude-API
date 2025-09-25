import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { makeCreateAddressUseCase } from "../../../use-cases/factories/make-create-address-use-case";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

export const createAddressRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/",
    {
      schema: {
        tags: ["Addresses"],
        summary: "Criar novo endereço",
        description:
          "Cria um novo endereço vinculado ao usuário autenticado. Todos os campos são obrigatórios exceto complement. O zipCode deve conter apenas números.",
        security: [{ bearerAuth: [] }],
        body: z.object({
          street: z.string().min(1, "Rua é obrigatória").describe("Nome da rua"),
          number: z
            .string()
            .min(1, "Número é obrigatório")
            .describe("Número do endereço"),
          complement: z.string().optional().describe("Complemento do endereço"),
          city: z.string().min(1, "Cidade é obrigatória").describe("Nome da cidade"),
          state: z.string().min(1, "Estado é obrigatório").describe("Nome do estado"),
          country: z.string().min(1, "País é obrigatório").describe("Nome do país"),
          zipCode: z
            .string()
            .regex(/^\d+$/, "CEP deve conter apenas números")
            .length(8, "CEP deve ter 8 dígitos")
            .describe("CEP (apenas números)"),
        }),
        response: {
          201: z.object({
            address: z.object({
              id: z.string().uuid(),
              userId: z.string().uuid(),
              street: z.string(),
              number: z.string().optional(),
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
        },
      },
    },
    async (request, reply) => {
      const { street, number, complement, city, state, country, zipCode } =
        request.body;

      try {
        const { sub: userId } = getAuthenticatedUserFromRequest(request);

        const createAddressUseCase = makeCreateAddressUseCase();

        const { address } = await createAddressUseCase.execute({
          userId,
          street,
          number,
          complement,
          city,
          state,
          country,
          zipCode,
        });

        return reply.status(201).send({
          address,
        });
      } catch (err) {
        throw err;
      }
    }
  );
};
