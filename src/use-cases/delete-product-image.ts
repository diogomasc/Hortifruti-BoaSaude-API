import type { ProductsRepository, ProductImagesRepository } from "../repositories/products-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { DeleteProductImageRequest } from "../types";

// Type alias for backward compatibility
type DeleteProductImageUseCaseRequest = DeleteProductImageRequest;

export class DeleteProductImageUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private productImagesRepository: ProductImagesRepository
  ) {}

  async execute({
    imageId,
    producerId,
  }: DeleteProductImageUseCaseRequest): Promise<void> {
    // Verificar se a imagem existe
    const image = await this.productImagesRepository.findById(imageId);

    if (!image) {
      throw new ResourceNotFoundError();
    }

    // Verificar se o produto da imagem pertence ao produtor
    const product = await this.productsRepository.findById(image.productId);

    if (!product) {
      throw new ResourceNotFoundError();
    }

    if (product.producerId !== producerId) {
      throw new Error("You can only delete images from your own products");
    }

    await this.productImagesRepository.delete(imageId);
  }
}