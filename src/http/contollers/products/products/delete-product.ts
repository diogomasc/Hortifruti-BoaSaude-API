import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserRole } from "../../../hooks/check-user-role";
import { checkRequestJWT } from "../../../hooks/check-request-jwt";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
import { makeDeleteProductUseCase } from "../../../../use-cases/factories/make-delete-product-use-case";

export const deleteProductRoute: FastifyPluginAsyncZod = async (server) => {
  server.delete(
    "/products/:id",
    {
      preHandler: [checkRequestJWT, checkUserRole("producer")],
      schema: {
        tags: ["Products"],
        summary: "Deletar produto",
        description:
          "Deleta um produto do produtor autenticado. Esta ação é irreversível.",
        params: z.object({
          id: z.string().uuid().describe("ID do produto"),
        }),
        response: {
          204: z.null().describe("Produto deletado com sucesso"),
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
