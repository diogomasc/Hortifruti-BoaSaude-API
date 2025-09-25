import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { makeGetUserProfileUseCase } from "../../../use-cases/factories/make-get-user-profile-use-case";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";
import { verifyJWT } from "../../middlewares/get-authenticated-user-from-request";
import { errorResponseSchema } from "../../schemas/common";

export const profileRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/profile",
    {
      preHandler: [verifyJWT],
      schema: {
        tags: ["Authentication"],
        summary: "Obter perfil do usuário autenticado",
        description:
          "Retorna os dados do perfil do usuário que está logado no sistema. Requer autenticação via token JWT no cabeçalho Authorization.",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            user: z.object({
              id: z.string().describe("ID único do usuário"),
              name: z.string().describe("Nome completo do usuário"),
              email: z.string().describe("Email do usuário"),
              role: z
                .enum(["consumer", "producer", "admin"])
                .describe("Papel do usuário no sistema"),
              isActive: z.boolean().describe("Status de ativação da conta"),
              createdAt: z.date().describe("Data de criação da conta"),
            }),
          }),
          401: errorResponseSchema.describe("Token não fornecido ou inválido"),
          404: errorResponseSchema.describe("Usuário não encontrado"),
        },
      },
    },
    async (request, reply) => {
      const { sub } = getAuthenticatedUserFromRequest(request);

      const getUserProfileUseCase = makeGetUserProfileUseCase();

      const { user } = await getUserProfileUseCase.execute({
        userId: sub,
      });

      return reply.status(200).send({
        user: {
          id: user.id,
          name: user.firstName + " " + user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      });
    }
  );
};
