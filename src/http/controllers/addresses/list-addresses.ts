import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { makeListUserAddressesUseCase } from "../../../use-cases/factories/make-list-user-addresses-use-case";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";
import {
  listAddressesQuerySchema,
  listAddressesResponseSchema,
} from "../../schemas/addresses";

export const listAddressesRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/",
    {
      schema: {
        tags: ["Addresses"],
        summary: "Listar endereços do usuário",
        description:
          "Lista todos os endereços vinculados ao usuário autenticado com paginação e busca.",
        security: [{ bearerAuth: [] }],
        querystring: listAddressesQuerySchema,
        response: listAddressesResponseSchema,
      },
    },
    async (request, reply) => {
      try {
        const { sub: userId } = getAuthenticatedUserFromRequest(request);
        const { search, limit, offset } = request.query;

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
  );
};