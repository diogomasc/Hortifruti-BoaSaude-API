import type { ProductsRepository } from "../repositories/products-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface DeleteProductUseCaseRequest {
  productId: string;
  producerId: string;
}

export class DeleteProductUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    productId,
    producerId,
  }: DeleteProductUseCaseRequest): Promise<void> {
    // Verificar se o produto existe
    const existingProduct = await this.productsRepository.findById(productId);

    if (!existingProduct) {
      throw new ResourceNotFoundError();
    }

    // Verificar se o produto pertence ao produtor
    if (existingProduct.producerId !== producerId) {
      throw new Error("You can only delete your own products");
    }

    await this.productsRepository.delete(productId);
  }
}