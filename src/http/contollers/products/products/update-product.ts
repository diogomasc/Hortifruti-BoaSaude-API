import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkRequestJWT } from "../../../hooks/check-request-jwt";
import { checkUserRole } from "../../../hooks/check-user-role";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
import { makeUpdateProductUseCase } from "../../../../use-cases/factories/make-update-product-use-case";

export const updateProductRoute: FastifyPluginAsyncZod = async (server) => {
  server.put(
    "/products/:id",
    {
      preHandler: [checkRequestJWT, checkUserRole("producer")],
      schema: {
        tags: ["Products"],
        summary: "Atualizar produto",
        description:
          "Atualiza um produto do produtor autenticado. Todos os campos são opcionais, apenas os fornecidos serão atualizados.",
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
          title: z.string().min(1).optional(),
          description: z.string().min(1).optional(),
          price: z
            .string()
            .regex(/^\d+(\.\d{1,2})?$/)
            .optional(),
          category: z
            .enum([
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
            ])
            .optional(),
          quantity: z.number().int().min(0).optional(),
        }),
        response: {
          200: z.object({
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
            .describe("Produto não pertence ao usuário"),
          404: z
            .object({ message: z.string() })
            .describe("Produto não encontrado"),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { title, description, price, category, quantity } = request.body;
      const user = getAuthenticatedUserFromRequest(request);

      const updateProductUseCase = makeUpdateProductUseCase();

      const { product } = await updateProductUseCase.execute({
        productId: id,
        producerId: user.sub,
        title,
        description,
        price,
        category,
        quantity,
      });

      return reply.status(200).send({ product });
    }
  );
};
