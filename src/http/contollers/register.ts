import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { RegisterUseCase } from "../../use-cases/register";
import { DrizzleUsersRepository } from "../../repositories/drizzle-users-repository";
import { UserAlreadyExistsError } from "../../use-cases/errors/user-already-exists-error";

const registerBodySchema = z
  .object({
    email: z.string().email("Email deve ter um formato válido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    firstName: z.string().min(1, "Nome é obrigatório"),
    lastName: z.string().min(1, "Sobrenome é obrigatório"),
    phone: z.string().optional(),
    role: z.enum(["consumer", "producer", "admin"]).default("consumer"),

    // Campos específicos para consumidores
    cpf: z.string().optional(),
    birthDate: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Data de nascimento deve estar no formato YYYY-MM-DD"
      )
      .optional()
      .describe(
        "Data de nascimento do consumidor (opcional). Formato obrigatório: YYYY-MM-DD (ex: 1990-01-15)"
      ),

    // Campos específicos para produtores
    cnpj: z.string().optional(),
    shopName: z.string().optional(),
    shopDescription: z.string().optional(),
  })
  .refine(
    (data) => {
      // Se for consumer, CPF é obrigatório
      if (data.role === "consumer" && !data.cpf) {
        return false;
      }
      // Se for producer, CNPJ é obrigatório
      if (data.role === "producer" && !data.cnpj) {
        return false;
      }
      // Admin não precisa de CPF nem CNPJ
      return true;
    },
    {
      message:
        "CPF é obrigatório para consumidores e CNPJ é obrigatório para produtores",
    }
  );

export const registerController: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/register",
    {
      schema: {
        tags: ["auth"],
        summary: "Register a new user",
        description: "Create a new user account as consumer, producer or admin",
        body: registerBodySchema,
        response: {
          201: z
            .object({
              message: z.string(),
              user: z.object({
                id: z.string().uuid(),
                email: z.string().email(),
                role: z.enum(["consumer", "producer", "admin"]),
                firstName: z.string(),
                lastName: z.string(),
                createdAt: z.string(),
              }),
            })
            .describe("Usuário criado com sucesso"),
          400: z
            .object({
              message: z.string(),
            })
            .describe("Informações inválidas"),
        },
      },
    },
    async (request, reply) => {
      try {
        // Instanciar dependências
        const usersRepository = new DrizzleUsersRepository();
        const registerUseCase = new RegisterUseCase(usersRepository);

        // Executar use case
        const { user } = await registerUseCase.execute(request.body);

        return reply.status(201).send({
          message: "Usuário criado com sucesso",
          user: {
            ...user,
            createdAt: user.createdAt.toISOString(),
          },
        });
      } catch (error) {
        if (error instanceof UserAlreadyExistsError) {
          return reply.status(400).send({
            message: "Informações inválidas",
          });
        }

        console.error("Erro ao criar usuário:", error);
        return reply.status(400).send({
          message: "Informações inválidas",
        });
      }
    }
  );
};
