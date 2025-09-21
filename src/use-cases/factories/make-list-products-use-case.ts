import { DrizzleProductsRepository } from "../../repositories/drizzle-products-repository";
import { ListProductsUseCase } from "../list-products";

export function makeListProductsUseCase() {
  const productsRepository = new DrizzleProductsRepository();
  const listProductsUseCase = new ListProductsUseCase(productsRepository);

  return listProductsUseCase;
}