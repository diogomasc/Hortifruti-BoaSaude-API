import type { ProductsRepository } from "../repositories/products-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface GetProductUseCaseRequest {
  productId: string;
}

interface GetProductUseCaseResponse {
  product: {
    id: string;
    title: string;
    description: string;
    price: string;
    category: string;
    producerId: string;
    quantity: number;
    createdAt: Date;
    images: Array<{
      id: string;
      productId: string;
      imageUrl: string;
    }>;
  };
}

export class GetProductUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    productId,
  }: GetProductUseCaseRequest): Promise<GetProductUseCaseResponse> {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new ResourceNotFoundError();
    }

    return {
      product: {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        producerId: product.producerId,
        quantity: product.quantity,
        createdAt: product.createdAt,
        images: product.images,
      },
    };
  }
}