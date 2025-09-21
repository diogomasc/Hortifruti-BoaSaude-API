import { DrizzleProductsRepository } from "../../repositories/drizzle-products-repository";
import { DrizzleUsersRepository } from "../../repositories/drizzle-users-repository";
import { CreateProductUseCase } from "../create-product";

export function makeCreateProductUseCase() {
  const productsRepository = new DrizzleProductsRepository();
  const usersRepository = new DrizzleUsersRepository();
  const createProductUseCase = new CreateProductUseCase(productsRepository, usersRepository);

  return createProductUseCase;
}