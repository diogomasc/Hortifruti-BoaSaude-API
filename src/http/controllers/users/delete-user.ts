import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { makeDeleteUserUseCase } from "../../../use-cases/factories/make-delete-user-use-case";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";
import { errorResponseSchema } from "../../schemas/common";

export const deleteUserRoute: FastifyPluginAsyncZod = async function (server) {
  server.delete(
    "/me/",
    {
      schema: {
        tags: ["Users"],
        summary: "Deletar conta do usuário",
        description:
          "Remove permanentemente a conta do usuário autenticado do sistema. Esta ação é irreversível e remove todos os dados associados.",
        security: [{ bearerAuth: [] }],
        response: {
          204: z.void().describe("Usuário deletado com sucesso"),
          401: errorResponseSchema.describe("Token não fornecido ou inválido"),
          404: errorResponseSchema.describe("Usuário não encontrado"),
        },
      },
    },
    async (request, reply) => {
      const { sub: userId } = getAuthenticatedUserFromRequest(request);

      const deleteUserUseCase = makeDeleteUserUseCase();

      await deleteUserUseCase.execute({
        userId,
      });

      return reply.status(204).send();
    }
  );
};
