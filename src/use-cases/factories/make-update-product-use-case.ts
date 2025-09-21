import { DrizzleProductsRepository } from "../../repositories/drizzle-products-repository";
import { UpdateProductUseCase } from "../update-product";

export function makeUpdateProductUseCase() {
  const productsRepository = new DrizzleProductsRepository();
  const updateProductUseCase = new UpdateProductUseCase(productsRepository);

  return updateProductUseCase;
}