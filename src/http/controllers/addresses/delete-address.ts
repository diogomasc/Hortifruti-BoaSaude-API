import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { makeDeleteAddressUseCase } from "../../../use-cases/factories/make-delete-address-use-case";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

export const deleteAddressRoute: FastifyPluginAsyncZod = async (server) => {
  server.delete(
    "/:id",
    {
      schema: {
        tags: ["Addresses"],
        summary: "Deletar endereço",
        description:
          "Deleta um endereço do usuário autenticado. Verifica se o endereço pertence ao usuário antes de deletar.",
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid("ID deve ser um UUID válido"),
        }),
        response: {
          204: z.null().describe("Endereço deletado com sucesso"),
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

      try {
        const { sub: userId } = getAuthenticatedUserFromRequest(request);

        const deleteAddressUseCase = makeDeleteAddressUseCase();

        await deleteAddressUseCase.execute({
          addressId: id,
          userId,
        });

        return reply.status(204).send();
      } catch (err) {
        if (err instanceof ResourceNotFoundError) {
          return reply.status(404).send({ message: "Endereço não encontrado ou não pertence ao usuário" });
        }

        throw err;
      }
    }
  );
};