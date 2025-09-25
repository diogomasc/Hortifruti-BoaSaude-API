import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
import { makeDeleteProductImageUseCase } from "../../../../use-cases/factories/make-delete-product-image-use-case";
import {
  productImageParamsSchema,
  deleteProductImageResponseSchema,
} from "../../../schemas/products";

export const deleteProductImageRoute: FastifyPluginAsyncZod = async (
  server
) => {
  server.delete(
    "/products/:id/images/:imageId/",
    {
      schema: {
        tags: ["Product Images"],
        summary: "Deletar imagem do produto",
        description:
          "Deleta uma imagem específica de um produto do produtor autenticado. Esta ação é irreversível.",
        params: productImageParamsSchema,
        response: deleteProductImageResponseSchema,
      },
    },
    async (request, reply) => {
      const { imageId } = request.params;
      const { sub: userId } = getAuthenticatedUserFromRequest(request);

      const deleteProductImageUseCase = makeDeleteProductImageUseCase();

      await deleteProductImageUseCase.execute({
        imageId,
        producerId: userId,
      });

      return reply.status(204).send();
    }
  );
};
