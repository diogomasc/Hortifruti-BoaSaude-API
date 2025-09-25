import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "../../../../database/client";
import { products, productImages } from "../../../../database/schema";
import { eq } from "drizzle-orm";
import { getProductByIdResponseSchema } from "../../../schemas/products";

export const getProductByIdRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/products/:id/",
    {
      schema: {
        tags: ["Products Public"],
        summary: "Obter produto por ID",
        description:
          "Obtém os detalhes de um produto específico pelo seu ID. Esta rota é pública e não requer autenticação.",
        params: z.object({
          id: z.string().uuid("ID deve ser um UUID válido"),
        }),
        response: getProductByIdResponseSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const result = await db
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
        .where(eq(products.id, id));

      if (result.length === 0) {
        return reply.status(404).send({
          message: "Produto não encontrado",
        });
      }

      // Agrupar produto com suas imagens
      const productData = {
        id: result[0].id,
        title: result[0].title,
        description: result[0].description,
        price: result[0].price,
        category: result[0].category,
        producerId: result[0].producerId,
        quantity: result[0].quantity,
        createdAt: result[0].createdAt,
        images: [] as Array<{
          id: string;
          productId: string;
          imageUrl: string;
        }>,
      };

      result.forEach((row) => {
        if (row.images && row.images.id) {
          productData.images.push(row.images);
        }
      });

      return reply.status(200).send({
        product: productData,
      });
    }
  );
};
