import { DrizzleProductsRepository, DrizzleProductImagesRepository } from "../../repositories/drizzle-products-repository";
import { DeleteProductImageUseCase } from "../delete-product-image";

export function makeDeleteProductImageUseCase() {
  const productsRepository = new DrizzleProductsRepository();
  const productImagesRepository = new DrizzleProductImagesRepository();
  const deleteProductImageUseCase = new DeleteProductImageUseCase(productsRepository, productImagesRepository);

  return deleteProductImageUseCase;
}