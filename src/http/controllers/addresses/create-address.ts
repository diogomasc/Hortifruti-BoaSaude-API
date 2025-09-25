import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { makeCreateAddressUseCase } from "../../../use-cases/factories/make-create-address-use-case";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";
import {
  createAddressBodySchema,
  createAddressResponseSchema,
} from "../../schemas/addresses";

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
        body: createAddressBodySchema,
        response: createAddressResponseSchema,
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
