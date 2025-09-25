import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
import { makeDeleteProductUseCase } from "../../../../use-cases/factories/make-delete-product-use-case";
import { deleteProductResponseSchema } from "../../../schemas/products";

export const deleteProductRoute: FastifyPluginAsyncZod = async (server) => {
  server.delete(
    "/products/:id/",
    {
      schema: {
        tags: ["Products"],
        summary: "Deletar produto",
        description:
          "Deleta um produto do produtor autenticado. Esta ação é irreversível.",
        params: z.object({
          id: z.string().uuid().describe("ID do produto"),
        }),
        response: deleteProductResponseSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const user = getAuthenticatedUserFromRequest(request);

      const deleteProductUseCase = makeDeleteProductUseCase();

      await deleteProductUseCase.execute({
        productId: id,
        producerId: user.sub,
      });

      return reply.status(204).send();
    }
  );
};
