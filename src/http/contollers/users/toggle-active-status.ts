import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeToggleUserActiveStatusUseCase } from "../../../use-cases/factories/make-toggle-user-active-status-use-case";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { ensureAuthenticated } from "../../../utils/auth-guard";

// Schema para documentação Swagger
export const toggleUserActiveStatusSchema = {
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
    400: z
      .object({
        message: z.string(),
      })
      .describe("Dados inválidos"),
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

export async function toggleUserActiveStatus(request: FastifyRequest, reply: FastifyReply) {
  const toggleActiveStatusBodySchema = z.object({
    isActive: z.boolean(),
  });

  const { isActive } = toggleActiveStatusBodySchema.parse(request.body);

  try {
    const userId = ensureAuthenticated(request, reply);

    const toggleUserActiveStatusUseCase = makeToggleUserActiveStatusUseCase();

    const { user } = await toggleUserActiveStatusUseCase.execute({
      userId,
      isActive,
    });

    return reply.status(200).send({
      user,
    });
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return reply.status(404).send({ message: err.message });
    }

    throw err;
  }
}