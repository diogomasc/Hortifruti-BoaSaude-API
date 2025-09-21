import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeGetUserCompleteProfileUseCase } from "../../../use-cases/factories/make-get-user-complete-profile-use-case";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { ensureAuthenticated } from "../../../utils/auth-guard";

// Schema para documentação Swagger
export const getUserProfileSchema = {
  tags: ["Users"],
  summary: "Obter perfil completo do usuário",
  description:
    "Retorna todos os dados do perfil do usuário autenticado, incluindo informações pessoais, endereços e wallet (para produtores). Requer autenticação via token JWT.",
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      user: z.object({
        id: z.string().uuid().describe("ID único do usuário"),
        email: z.string().email().describe("Email do usuário"),
        firstName: z.string().describe("Primeiro nome"),
        lastName: z.string().describe("Sobrenome"),
        phone: z.string().nullable().describe("Telefone do usuário"),
        role: z
          .enum(["consumer", "producer", "admin"])
          .describe("Papel do usuário no sistema"),
        isActive: z.boolean().describe("Status de ativação da conta"),
        createdAt: z.date().describe("Data de criação da conta"),
        // Campos específicos por role
        cpf: z.string().nullable().optional().describe("CPF (apenas consumidores)"),
        birthDate: z
          .string()
          .nullable()
          .optional()
          .describe("Data de nascimento (apenas consumidores)"),
        cnpj: z.string().nullable().optional().describe("CNPJ (apenas produtores)"),
        shopName: z
          .string()
          .nullable()
          .optional()
          .describe("Nome da loja (apenas produtores)"),
        shopDescription: z
          .string()
          .nullable()
          .optional()
          .describe("Descrição da loja (apenas produtores)"),
        // Relacionamentos
        addresses: z
          .array(
            z.object({
              id: z.string().uuid(),
              street: z.string(),
              number: z.string().nullable(),
              complement: z.string().nullable(),
              city: z.string(),
              state: z.string(),
              country: z.string(),
              zipCode: z.string().nullable(),
            })
          )
          .describe("Endereços do usuário"),
        wallet: z
          .object({
            id: z.string().uuid(),
            balance: z.string(),
            updatedAt: z.date(),
          })
          .nullable()
          .optional()
          .describe("Carteira digital (apenas produtores)"),
      }),
    }),
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

export async function getUserProfile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = ensureAuthenticated(request, reply);

    const getUserCompleteProfileUseCase = makeGetUserCompleteProfileUseCase();

    const { user } = await getUserCompleteProfileUseCase.execute({
      userId,
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