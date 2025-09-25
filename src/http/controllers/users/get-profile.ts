import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { makeGetUserCompleteProfileUseCase } from "../../../use-cases/factories/make-get-user-complete-profile-use-case";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";
import { getUserProfileResponseSchema } from "../../schemas/users";

export const getUserProfileRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/me/",
    {
      schema: {
        tags: ["Users"],
        summary: "Obter perfil completo do usuário",
        description:
          "Retorna todos os dados do perfil do usuário autenticado, incluindo informações pessoais, endereços e wallet (para produtores). Requer autenticação via token JWT.",
        security: [{ bearerAuth: [] }],
        response: getUserProfileResponseSchema,
      },
    },
    async (request, reply) => {
      const { sub: userId } = getAuthenticatedUserFromRequest(request);

      const getUserCompleteProfileUseCase = makeGetUserCompleteProfileUseCase();

      const { user } = await getUserCompleteProfileUseCase.execute({
        userId,
      });

      return reply.status(200).send({
        user,
      });
    }
  );
};
