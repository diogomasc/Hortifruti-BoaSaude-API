import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkRequestJWT } from "../../../hooks/check-request-jwt";
import { checkUserRole } from "../../../hooks/check-user-role";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
import { db } from "../../../../database/client";
import { products, productImages } from "../../../../database/schema";
import { ilike, asc, type SQL, and, eq } from "drizzle-orm";

export const listProducerProductsRoute: FastifyPluginAsyncZod = async (
  server
) => {
  server.get(
    "/products/me",
    {
      preHandler: [checkRequestJWT, checkUserRole("producer")],
      schema: {
        tags: ["Products"],
        summary: "Listar produtos do produtor",
        description:
          "Lista todos os produtos do produtor autenticado com paginação e filtros. Requer autenticação e que o usuário seja um produtor.",
        querystring: z.object({
          search: z.string().optional(),
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
          page: z.coerce.number().int().min(1).default(1),
        }),
        response: {
          200: z.object({
            products: z.array(
              z.object({
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
              })
            ),
            total: z.number(),
          }),
          401: z
            .object({
              message: z.string(),
            })
            .describe("Token não fornecido ou inválido"),
          403: z
            .object({
              message: z.string(),
            })
            .describe("Usuário não é um produtor"),
          404: z
            .object({
              message: z.string(),
            })
            .describe("Usuário não encontrado"),
        },
      },
    },
    async (request, reply) => {
      const { search, category, page } = request.query;
      const user = getAuthenticatedUserFromRequest(request);

      const conditions: SQL[] = [eq(products.producerId, user.sub)];

      if (search) {
        conditions.push(ilike(products.title, `%${search}%`));
      }

      if (category) {
        conditions.push(eq(products.category, category));
      }

      const [result, total] = await Promise.all([
        db
          .select({
            id: products.id,
            title: products.title,
            description: products.description,
            price: products.price,
            category: products.category,
            producerId: products.producerId,
            quantity: products.quantity,
            createdAt: products.createdAt,
            images: {
              id: productImages.id,
              productId: productImages.productId,
              imageUrl: productImages.imageUrl,
            },
          })
          .from(products)
          .leftJoin(productImages, eq(productImages.productId, products.id))
          .orderBy(asc(products.createdAt))
          .offset((page - 1) * 12)
          .limit(12)
          .where(and(...conditions)),
        db.$count(products, and(...conditions)),
      ]);

      // Agrupar produtos com suas imagens
      const productsMap = new Map();

      result.forEach((row) => {
        const productId = row.id;

        if (!productsMap.has(productId)) {
          productsMap.set(productId, {
            id: row.id,
            title: row.title,
            description: row.description,
            price: row.price,
            category: row.category,
            producerId: row.producerId,
            quantity: row.quantity,
            createdAt: row.createdAt,
            images: [],
          });
        }

        if (row.images && row.images.id) {
          productsMap.get(productId).images.push(row.images);
        }
      });

      const productsWithImages = Array.from(productsMap.values());

      return reply.status(200).send({
        products: productsWithImages,
        total,
      });
    }
  );
};
