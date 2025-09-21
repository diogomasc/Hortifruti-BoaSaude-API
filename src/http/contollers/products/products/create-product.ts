import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkRequestJWT } from "../../../hooks/check-request-jwt";
import { checkUserRole } from "../../../hooks/check-user-role";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
import { makeCreateProductUseCase } from "../../../../use-cases/factories/make-create-product-use-case";

export const createProductRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/products",
    {
      preHandler: [checkRequestJWT, checkUserRole("producer")],
      schema: {
        tags: ["Products"],
        summary: "Criar novo produto",
        description:
          "Cria um novo produto vinculado ao produtor autenticado. Todos os campos são obrigatórios. O preço deve ser um valor decimal positivo.",
        body: z.object({
          title: z.string().min(1, "Título é obrigatório"),
          description: z.string().min(1, "Descrição é obrigatória"),
          price: z
            .string()
            .regex(
              /^\d+(\.\d{1,2})?$/,
              "Preço deve ser um valor decimal válido"
            ),
          category: z.enum([
            "frutas",
            "legumes",
            "verduras",
            "ervas",
            "graos",
            "tuberculos",
            "hortalicas",
            "organicos",
            "ovos",
            "mel",
            "cogumelos",
            "temperos",
            "sementes",
            "castanhas",
            "integrais",
            "conservas",
            "compotas",
            "polpa_fruta",
            "polpa_vegetal",
            "sazonal",
            "flores_comestiveis",
            "vegano",
            "kits",
            "outros",
          ]),
          quantity: z
            .number()
            .int()
            .min(0, "Quantidade deve ser um número inteiro positivo"),
        }),
        response: {
          201: z.object({
            product: z.object({
              id: z.string().uuid(),
              title: z.string(),
              description: z.string(),
              price: z.string(),
              category: z.string(),
              producerId: z.string().uuid(),
              quantity: z.number(),
              createdAt: z.date(),
              images: z.array(
                z.object({
                  id: z.string().uuid(),
                  productId: z.string().uuid(),
                  imageUrl: z.string(),
                })
              ),
            }),
          }),
          400: z.object({ message: z.string() }).describe("Dados inválidos"),
          401: z
            .object({ message: z.string() })
            .describe("Token não fornecido ou inválido"),
          403: z
            .object({ message: z.string() })
            .describe("Usuário não é um produtor"),
        },
      },
    },
    async (request, reply) => {
      const { title, description, price, category, quantity } = request.body;
      const user = getAuthenticatedUserFromRequest(request);

      const createProductUseCase = makeCreateProductUseCase();

      const { product } = await createProductUseCase.execute({
        title,
        description,
        price,
        category,
        quantity,
        producerId: user.sub,
      });

      return reply.status(201).send({ product });
    }
  );
};
