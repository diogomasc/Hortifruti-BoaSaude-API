import type { ProductsRepository, ProductImagesRepository } from "../repositories/products-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface AddProductImageUseCaseRequest {
  productId: string;
  producerId: string;
  imageUrl: string;
}

interface AddProductImageUseCaseResponse {
  image: {
    id: string;
    productId: string;
    imageUrl: string;
  };
}

export class AddProductImageUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private productImagesRepository: ProductImagesRepository
  ) {}

  async execute({
    productId,
    producerId,
    imageUrl,
  }: AddProductImageUseCaseRequest): Promise<AddProductImageUseCaseResponse> {
    // Verificar se o produto existe
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new ResourceNotFoundError();
    }

    // Verificar se o produto pertence ao produtor
    if (product.producerId !== producerId) {
      throw new Error("You can only add images to your own products");
    }

    // Verificar se já existem 6 imagens
    const existingImages = await this.productImagesRepository.findByProductId(productId);
    
    if (existingImages.length >= 6) {
      throw new Error("Maximum of 6 images per product allowed");
    }

    const image = await this.productImagesRepository.create({
      productId,
      imageUrl,
    });

    return {
      image: {
        id: image.id,
        productId: image.productId,
        imageUrl: image.imageUrl,
      },
    };
  }
}