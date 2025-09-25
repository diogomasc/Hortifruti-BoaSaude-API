import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
import { makeCreateProductUseCase } from "../../../../use-cases/factories/make-create-product-use-case";
import {
  createProductBodySchema,
  createProductResponseSchema,
} from "../../../schemas/products";

export const createProductRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/products/",
    {
      schema: {
        tags: ["Products"],
        summary: "Criar novo produto",
        description:
          "Cria um novo produto vinculado ao produtor autenticado. Todos os campos são obrigatórios. O preço deve ser um valor decimal positivo.",
        body: createProductBodySchema,
        response: createProductResponseSchema,
      },
    },
    async (request, reply) => {
      const { title, description, price, category, quantity } = request.body;
      const user = getAuthenticatedUserFromRequest(request);

      const createProductUseCase = makeCreateProductUseCase();

      const { product } = await createProductUseCase.execute({
        title,
        description,
        price,
        category,
        quantity,
        producerId: user.sub,
      });

      return reply.status(201).send({ product });
    }
  );
};
