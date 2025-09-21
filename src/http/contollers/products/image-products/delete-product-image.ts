import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkRequestJWT } from "../../../hooks/check-request-jwt";
import { checkUserRole } from "../../../hooks/check-user-role";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
import { makeDeleteProductImageUseCase } from "../../../../use-cases/factories/make-delete-product-image-use-case";

export const deleteProductImageRoute: FastifyPluginAsyncZod = async (
  server
) => {
  server.delete(
    "/products/:id/images/:imageId",
    {
      preHandler: [checkRequestJWT, checkUserRole("producer")],
      schema: {
        tags: ["Product Images"],
        summary: "Deletar imagem do produto",
        description:
          "Deleta uma imagem específica de um produto do produtor autenticado. Esta ação é irreversível.",
        params: z.object({
          id: z.string().uuid().describe("ID do produto"),
          imageId: z.string().uuid().describe("ID da imagem"),
        }),
        response: {
          204: z.null().describe("Imagem deletada com sucesso"),
          401: z
            .object({
              message: z.string(),
            })
            .describe("Token não fornecido ou inválido"),
          403: z
            .object({
              message: z.string(),
            })
            .describe("Imagem não pertence ao usuário"),
          404: z
            .object({
              message: z.string(),
            })
            .describe("Imagem não encontrada"),
        },
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
