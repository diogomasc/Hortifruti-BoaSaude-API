import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getAuthenticatedUserFromRequest } from "../../../middlewares/get-authenticated-user-from-request";
import { makeAddProductImageUseCase } from "../../../../use-cases/factories/make-add-product-image-use-case";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { mkdir } from "fs/promises";
import { addProductImageResponseSchema } from "../../../schemas/products";

export const addProductImageRoute: FastifyPluginAsyncZod = async (server) => {
  // Registrar plugin para multipart
  await server.register(import("@fastify/multipart"), {
    limits: {
      fileSize: 3 * 1024 * 1024, // 3MB
    },
  });

  server.post(
    "/products/:id/images/",
    {
      schema: {
        tags: ["Product Images"],
        summary: "Adicionar imagem ao produto",
        description:
          "Adiciona uma imagem a um produto do produtor autenticado. Máximo de 6 imagens por produto. A imagem deve ser enviada como multipart/form-data.",
        params: z.object({
          id: z.string().uuid().describe("ID do produto"),
        }),
        consumes: ["multipart/form-data"],
        response: addProductImageResponseSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { sub: userId } = getAuthenticatedUserFromRequest(request);

      // Verificar se há arquivo enviado
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({
          message: "Nenhum arquivo de imagem foi enviado",
        });
      }

      // Verificar tipo do arquivo
      const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedMimeTypes.includes(data.mimetype)) {
        return reply.status(400).send({
          message: "Tipo de arquivo não suportado. Use JPG, PNG ou WebP",
        });
      }

      // Criar diretório de uploads se não existir
      const uploadsDir = join(process.cwd(), "uploads", "products");
      await mkdir(uploadsDir, { recursive: true });

      // Gerar nome único para o arquivo
      const fileExtension = data.filename?.split(".").pop() || "jpg";
      const fileName = `${randomUUID()}.${fileExtension}`;
      const filePath = join(uploadsDir, fileName);

      // Salvar arquivo
      await pipeline(data.file, createWriteStream(filePath));

      // URL da imagem para servir estaticamente
      const imageUrl = `/uploads/products/${fileName}`;

      const addProductImageUseCase = makeAddProductImageUseCase();

      const { image } = await addProductImageUseCase.execute({
        productId: id,
        producerId: userId,
        imageUrl,
      });

      return reply.status(201).send({
        image,
      });
    }
  );
};
