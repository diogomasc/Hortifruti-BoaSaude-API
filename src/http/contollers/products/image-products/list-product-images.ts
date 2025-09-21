import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkRequestJWT } from "../../../hooks/check-request-jwt";
import { checkUserRole } from "../../../hooks/check-user-role";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
import { makeListProductImagesUseCase } from "../../../../use-cases/factories/make-list-product-images-use-case";

export const listProductImagesRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/products/:id/images",
    {
      preHandler: [checkRequestJWT, checkUserRole("producer")],
      schema: {
        tags: ["Product Images"],
        summary: "Listar imagens do produto",
        description:
          "Lista todas as imagens de um produto específico do produtor autenticado.",
        params: z.object({
          id: z.string().uuid().describe("ID do produto"),
        }),
        response: {
          200: z.object({
            images: z.array(
              z.object({
                id: z.string().uuid(),
                productId: z.string().uuid(),
                imageUrl: z.string(),
              })
            ),
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
            .describe("Produto não pertence ao usuário"),
          404: z
            .object({
              message: z.string(),
            })
            .describe("Produto não encontrado"),
        },
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
