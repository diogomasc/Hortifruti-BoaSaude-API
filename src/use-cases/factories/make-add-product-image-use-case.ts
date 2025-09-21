import { DrizzleProductsRepository, DrizzleProductImagesRepository } from "../../repositories/drizzle-products-repository";
import { AddProductImageUseCase } from "../add-product-image";

export function makeAddProductImageUseCase() {
  const productsRepository = new DrizzleProductsRepository();
  const productImagesRepository = new DrizzleProductImagesRepository();
  const addProductImageUseCase = new AddProductImageUseCase(productsRepository, productImagesRepository);

  return addProductImageUseCase;
}