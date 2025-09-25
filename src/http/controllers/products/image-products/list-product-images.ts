import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
import { makeListProductImagesUseCase } from "../../../../use-cases/factories/make-list-product-images-use-case";
import {
  productParamsSchema,
  listProductImagesResponseSchema,
} from "../../../schemas/products";

export const listProductImagesRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/products/:id/images/",
    {
      schema: {
        tags: ["Product Images"],
        summary: "Listar imagens do produto",
        description:
          "Lista todas as imagens de um produto específico do produtor autenticado.",
        params: productParamsSchema,
        response: listProductImagesResponseSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { sub: userId } = getAuthenticatedUserFromRequest(request);

      const listProductImagesUseCase = makeListProductImagesUseCase();

      const { images } = await listProductImagesUseCase.execute({
        productId: id,
        producerId: userId,
      });

      return reply.status(200).send({
        images,
      });
    }
  );
};
