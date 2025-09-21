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

export async function productsRoutes(app: FastifyInstance) {
  // Registrar todas as rotas de produtos
  await app.register(listProductsRoute);
  await app.register(getProductByIdRoute);
  await app.register(listProducerProductsRoute);
  await app.register(createProductRoute);
  await app.register(updateProductRoute);
  await app.register(deleteProductRoute);

  // Registrar todas as rotas de imagens de produtos
  await app.register(addProductImageRoute);
  await app.register(deleteProductImageRoute);
  await app.register(listProductImagesRoute);
}
