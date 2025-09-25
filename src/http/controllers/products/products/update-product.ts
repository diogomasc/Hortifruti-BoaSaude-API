import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
import { makeUpdateProductUseCase } from "../../../../use-cases/factories/make-update-product-use-case";
import {
  updateProductBodySchema,
  updateProductResponseSchema,
} from "../../../schemas/products";

export const updateProductRoute: FastifyPluginAsyncZod = async (server) => {
  server.put(
    "/products/:id/",
    {
      schema: {
        tags: ["Products"],
        summary: "Atualizar produto",
        description:
          "Atualiza um produto do produtor autenticado. Todos os campos são opcionais, apenas os fornecidos serão atualizados.",
        params: z.object({
          id: z.string().uuid(),
        }),
        body: updateProductBodySchema,
        response: updateProductResponseSchema,
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
