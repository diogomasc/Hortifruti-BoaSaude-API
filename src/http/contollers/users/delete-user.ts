import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeDeleteUserUseCase } from "../../../use-cases/factories/make-delete-user-use-case";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

// Schema para documentação Swagger
export const deleteUserSchema = {
  tags: ["Users"],
  summary: "Deletar conta do usuário",
  description:
    "Remove permanentemente a conta do usuário autenticado do sistema. Esta ação é irreversível e remove todos os dados associados.",
  security: [{ bearerAuth: [] }],
  response: {
    204: z.void().describe("Usuário deletado com sucesso"),
    401: z
      .object({
        message: z.string(),
      })
      .describe("Token não fornecido ou inválido"),
    404: z
      .object({
        message: z.string(),
      })
      .describe("Usuário não encontrado"),
  },
};

export async function deleteUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { sub: userId } = getAuthenticatedUserFromRequest(request);

    const deleteUserUseCase = makeDeleteUserUseCase();

    await deleteUserUseCase.execute({
      userId,
    });

    return reply.status(204).send();
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }

    throw err;
  }
}