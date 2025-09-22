import type { FastifyInstance } from "fastify";
import { listProductsRoute } from "./products-public/list-products";
import { listProducerProductsRoute } from "./products/list-producer-products";
import { getProductByIdRoute } from "./products-public/get-product-by-id";
import { createProductRoute } from "./products/create-product";
import { updateProductRoute } from "./products/update-product";
import { deleteProductRoute } from "./products/delete-product";
import { addProductImageRoute } from "./image-products/add-product-image";
import { deleteProductImageRoute } from "./image-products/delete-product-image";
import { listProductImagesRoute } from "./image-products/list-product-images";
import { verifyUserRole } from "../../middlewares/verify-user-role";

export async function productsRoutes(app: FastifyInstance) {
  // Registrar todas as rotas públicas de produtos (sem autenticação)
  await app.register(listProductsRoute);
  await app.register(getProductByIdRoute);

  // Registrar rotas que requerem autenticação de produtor
  await app.register(async function (app) {
    app.addHook("preHandler", verifyUserRole("producer"));

    await app.register(listProducerProductsRoute);
    await app.register(createProductRoute);
    await app.register(updateProductRoute);
    await app.register(deleteProductRoute);
    await app.register(addProductImageRoute);
    await app.register(deleteProductImageRoute);
    await app.register(listProductImagesRoute);
  });
}
