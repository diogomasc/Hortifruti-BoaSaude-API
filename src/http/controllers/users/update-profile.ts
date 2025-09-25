import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { makeUpdateUserProfileUseCase } from "../../../use-cases/factories/make-update-user-profile-use-case";
import { ResourceNotFoundError } from "../../../use-cases/errors/resource-not-found-error";
import { UserAlreadyExistsError } from "../../../use-cases/errors/user-already-exists-error";
import { getAuthenticatedUserFromRequest } from "../../middlewares/get-authenticated-user-from-request";

export const updateUserProfileRoute: FastifyPluginAsyncZod = async (server) => {
  server.put(
    "/me",
    {
      schema: {
        tags: ["Users"],
        summary: "Atualizar perfil do usuário",
        description:
          "Atualiza os dados do perfil do usuário autenticado. Todos os campos são opcionais, apenas os campos enviados serão atualizados. Validações de unicidade são aplicadas para email, CPF e CNPJ.",
        security: [{ bearerAuth: [] }],
        body: z.object({
          email: z
            .string()
            .email("Email deve ter um formato válido")
            .optional()
            .describe("Novo email do usuário"),
          firstName: z
            .string()
            .min(1, "Nome é obrigatório")
            .optional()
            .describe("Primeiro nome"),
          lastName: z
            .string()
            .min(1, "Sobrenome é obrigatório")
            .optional()
            .describe("Sobrenome"),
          phone: z
            .string()
            .regex(/^\d+$/, "Telefone deve conter apenas números")
            .length(11, "Telefone deve ter 11 dígitos")
            .optional()
            .describe("Telefone com DDD (apenas números)"),
          cpf: z
            .string()
            .regex(/^\d+$/, "CPF deve conter apenas números")
            .length(11, "CPF deve ter 11 dígitos")
            .optional()
            .describe("CPF (apenas números, para consumidores)"),
          birthDate: z
            .string()
            .optional()
            .describe("Data de nascimento no formato YYYY-MM-DD"),
          cnpj: z
            .string()
            .regex(/^\d+$/, "CNPJ deve conter apenas números")
            .length(14, "CNPJ deve ter 14 dígitos")
            .optional()
            .describe("CNPJ (apenas números, para produtores)"),
          shopName: z
            .string()
            .min(1)
            .optional()
            .describe("Nome da loja (para produtores)"),
          shopDescription: z
            .string()
            .optional()
            .describe("Descrição da loja (para produtores)"),
        }),
        response: {
          200: z.object({
            user: z.object({
              id: z.string().uuid(),
              email: z.string().email(),
              firstName: z.string(),
              lastName: z.string(),
              phone: z.string().optional(),
              role: z.enum(["consumer", "producer", "admin"]),
              isActive: z.boolean(),
              createdAt: z.date(),
              cpf: z.string().nullable().optional(),
              birthDate: z.string().nullable().optional(),
              cnpj: z.string().nullable().optional(),
              shopName: z.string().nullable().optional(),
              shopDescription: z.string().nullable().optional(),
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
          409: z
            .object({
              message: z.string(),
            })
            .describe("Email, CPF ou CNPJ já existe"),
        },
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

      try {
        const { sub: userId } = getAuthenticatedUserFromRequest(request);

        const updateUserProfileUseCase = makeUpdateUserProfileUseCase();

        const { user } = await updateUserProfileUseCase.execute({
          userId,
          email,
          firstName,
          lastName,
          phone,
          cpf,
          birthDate,
          cnpj,
          shopName,
          shopDescription,
        });

        return reply.status(200).send({
          user,
        });
      } catch (err) {
        if (err instanceof ResourceNotFoundError) {
          return reply.status(404).send({ message: err.message });
        }

        if (err instanceof UserAlreadyExistsError) {
          return reply.status(409).send({ message: err.message });
        }

        throw err;
      }
    }
  );
};
