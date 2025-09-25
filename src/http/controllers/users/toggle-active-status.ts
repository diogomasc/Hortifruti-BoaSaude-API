import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { makeToggleUserActiveStatusUseCase } from "../../../use-cases/factories/make-toggle-user-active-status-use-case";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";
import { errorResponseSchema } from "../../schemas/common";

export const toggleUserActiveStatusRoute: FastifyPluginAsyncZod =
  async function (server) {
    server.patch(
      "/me/active/",
      {
        schema: {
          tags: ["Users"],
          summary: "Alternar status ativo do usuário",
          description:
            "Alterna o status de ativação da conta do usuário autenticado. Permite ativar ou desativar a conta.",
          security: [{ bearerAuth: [] }],
          body: z.object({
            isActive: z.boolean().describe("Novo status de ativação da conta"),
          }),
          response: {
            200: z.object({
              user: z.object({
                id: z.string().uuid(),
                email: z.string().email(),
                firstName: z.string(),
                lastName: z.string(),
                role: z.enum(["consumer", "producer", "admin"]),
                isActive: z.boolean().describe("Novo status de ativação"),
                createdAt: z.date(),
              }),
            }),
            400: errorResponseSchema.describe("Dados inválidos"),
            401: errorResponseSchema.describe(
              "Token não fornecido ou inválido"
            ),
            404: errorResponseSchema.describe("Usuário não encontrado"),
          },
        },
      },
      async (request, reply) => {
        const { isActive } = request.body;

        const { sub: userId } = getAuthenticatedUserFromRequest(request);

        const toggleUserActiveStatusUseCase =
          makeToggleUserActiveStatusUseCase();

        const { user } = await toggleUserActiveStatusUseCase.execute({
          userId,
          isActive,
        });

        return reply.status(200).send({
          user,
        });
      }
    );
  };
