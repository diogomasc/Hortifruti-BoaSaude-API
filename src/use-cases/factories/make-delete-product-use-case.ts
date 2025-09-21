import { DrizzleProductsRepository } from "../../repositories/drizzle-products-repository";
import { DeleteProductUseCase } from "../delete-product";

export function makeDeleteProductUseCase() {
  const productsRepository = new DrizzleProductsRepository();
  const deleteProductUseCase = new DeleteProductUseCase(productsRepository);

  return deleteProductUseCase;
}