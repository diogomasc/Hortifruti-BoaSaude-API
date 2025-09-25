import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { makeDeleteAddressUseCase } from "../../../use-cases/factories/make-delete-address-use-case";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";
import {
  addressParamsSchema,
  deleteAddressResponseSchema,
} from "../../schemas/addresses";

export const deleteAddressRoute: FastifyPluginAsyncZod = async (server) => {
  server.delete(
    "/:id/",
    {
      schema: {
        tags: ["Addresses"],
        summary: "Deletar endereço",
        description:
          "Deleta um endereço do usuário autenticado. Verifica se o endereço pertence ao usuário antes de deletar.",
        security: [{ bearerAuth: [] }],
        params: addressParamsSchema,
        response: deleteAddressResponseSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const { sub: userId } = getAuthenticatedUserFromRequest(request);

      const deleteAddressUseCase = makeDeleteAddressUseCase();

      await deleteAddressUseCase.execute({
        addressId: id,
        userId,
      });

      return reply.status(204).send();
    }
  );
};
