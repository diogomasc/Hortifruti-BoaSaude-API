import type { ProductsRepository, ProductImagesRepository } from "../repositories/products-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface ListProductImagesUseCaseRequest {
  productId: string;
  producerId: string;
}

interface ListProductImagesUseCaseResponse {
  images: Array<{
    id: string;
    productId: string;
    imageUrl: string;
  }>;
}

export class ListProductImagesUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private productImagesRepository: ProductImagesRepository
  ) {}

  async execute({
    productId,
    producerId,
  }: ListProductImagesUseCaseRequest): Promise<ListProductImagesUseCaseResponse> {
    // Verificar se o produto existe
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new ResourceNotFoundError();
    }

    // Verificar se o produto pertence ao produtor
    if (product.producerId !== producerId) {
      throw new Error("You can only view images from your own products");
    }

    const images = await this.productImagesRepository.findByProductId(productId);

    return {
      images: images.map((image) => ({
        id: image.id,
        productId: image.productId,
        imageUrl: image.imageUrl,
      })),
    };
  }
}