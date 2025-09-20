import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { InvalidCredentialsError } from "../../use-cases/errors/invalid-credentials-error";
import { makeAuthenticateUseCase } from "../../use-cases/factories/make-authenticate-use-case";

const loginBodySchema = z.object({
  email: z.string().email("Email deve ter um formato válido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const loginController: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/login",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Login do usuário",
        body: loginBodySchema,
        response: {
          200: z.object({
            user: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              role: z.enum(["consumer", "producer", "admin"]),
              isActive: z.boolean(),
              createdAt: z.date(),
            }),
            token: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      try {
        const authenticateUseCase = makeAuthenticateUseCase();

        const { user, token } = await authenticateUseCase.execute({
          email,
          password,
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
          token,
        });
      } catch (err) {
        if (err instanceof InvalidCredentialsError) {
          return reply.status(400).send({ message: err.message });
        }

        throw err;
      }
    }
  );
};
