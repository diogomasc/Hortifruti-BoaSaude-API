import { DrizzleProductsRepository } from "../../repositories/drizzle-products-repository";
import { DrizzleUsersRepository } from "../../repositories/drizzle-users-repository";
import { ListProducerProductsUseCase } from "../list-producer-products";

export function makeListProducerProductsUseCase() {
  const productsRepository = new DrizzleProductsRepository();
  const usersRepository = new DrizzleUsersRepository();
  const listProducerProductsUseCase = new ListProducerProductsUseCase(productsRepository, usersRepository);

  return listProducerProductsUseCase;
}