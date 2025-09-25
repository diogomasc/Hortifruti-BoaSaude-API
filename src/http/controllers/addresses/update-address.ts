import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { makeUpdateAddressUseCase } from "../../../use-cases/factories/make-update-address-use-case";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";
import {
  addressParamsSchema,
  updateAddressBodySchema,
  updateAddressResponseSchema,
} from "../../schemas/addresses";

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
        params: addressParamsSchema,
        body: updateAddressBodySchema,
        response: updateAddressResponseSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { street, number, complement, city, state, country, zipCode } =
        request.body;

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
    }
  );
};
