import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { makeUpdateUserProfileUseCase } from "../../../use-cases/factories/make-update-user-profile-use-case";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { UserAlreadyExistsError } from "../../../use-cases/errors/user-already-exists-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";
import {
  updateUserProfileBodySchema,
  updateUserProfileResponseSchema,
} from "../../schemas/users";

export const updateUserProfileRoute: FastifyPluginAsyncZod = async (server) => {
  server.put(
    "/me/",
    {
      schema: {
        tags: ["Users"],
        summary: "Atualizar perfil do usuário",
        description:
          "Atualiza os dados do perfil do usuário autenticado. Todos os campos são opcionais, apenas os campos enviados serão atualizados. Validações de unicidade são aplicadas para email, CPF e CNPJ.",
        security: [{ bearerAuth: [] }],
        body: updateUserProfileBodySchema,
        response: updateUserProfileResponseSchema,
      },
    },
    async (request, reply) => {
      const {
        email,
        firstName,
        lastName,
        phone,
        cpf,
        birthDate,
        cnpj,
        shopName,
        shopDescription,
      } = request.body;

      const { sub: userId } = getAuthenticatedUserFromRequest(request);

      const updateUserProfileUseCase = makeUpdateUserProfileUseCase();

      const { user } = await updateUserProfileUseCase.execute({
        userId,
        data: {
          email,
          firstName,
          lastName,
          phone,
          cpf,
          birthDate,
          cnpj,
          shopName,
          shopDescription,
        },
      });

      return reply.status(200).send({
        user,
      });
    }
  );
};
