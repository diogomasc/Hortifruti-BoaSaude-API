import { DrizzleProductsRepository, DrizzleProductImagesRepository } from "../../repositories/drizzle-products-repository";
import { ListProductImagesUseCase } from "../list-product-images";

export function makeListProductImagesUseCase() {
  const productsRepository = new DrizzleProductsRepository();
  const productImagesRepository = new DrizzleProductImagesRepository();
  const listProductImagesUseCase = new ListProductImagesUseCase(productsRepository, productImagesRepository);

  return listProductImagesUseCase;
}