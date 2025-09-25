import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "../../../../database/client";
import { products, productImages } from "../../../../database/schema";
import { ilike, asc, desc, type SQL, and, eq } from "drizzle-orm";

export const listProductsRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/products",
    {
      schema: {
        tags: ["Products Public"],
        summary: "Listar produtos públicos",
        description:
          "Lista todos os produtos disponíveis com paginação e filtros de busca. Esta rota é pública e não requer autenticação.",
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
          producerId: z.string().uuid().optional(),
          limit: z.coerce.number().int().min(1).max(100).default(12),
          offset: z.coerce.number().int().min(0).default(0),
          sortByPrice: z.enum(["desc", "asc"]).optional().default("desc"),
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
          400: z
            .object({ message: z.string() })
            .describe("Parâmetros inválidos"),
        },
      },
    },
    async (request, reply) => {
      const { search, category, producerId, limit, offset, sortByPrice } = request.query;

      const conditions: SQL[] = [];

      if (search) {
        conditions.push(ilike(products.title, `%${search}%`));
      }

      if (category) {
        conditions.push(eq(products.category, category));
      }

      if (producerId) {
        conditions.push(eq(products.producerId, producerId));
      }

      // Usar o offset fornecido diretamente
      const calculatedOffset = offset;

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
          .orderBy(sortByPrice === "asc" ? asc(products.price) : desc(products.price))
          .offset(calculatedOffset)
          .limit(limit)
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

      return reply.send({ products: productsWithImages, total });
    }
  );
};
