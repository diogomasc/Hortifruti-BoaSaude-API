import type { ProductsRepository } from "../repositories/products-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface UpdateProductUseCaseRequest {
  productId: string;
  producerId: string;
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  quantity?: number;
}

interface UpdateProductUseCaseResponse {
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

export class UpdateProductUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    productId,
    producerId,
    title,
    description,
    price,
    category,
    quantity,
  }: UpdateProductUseCaseRequest): Promise<UpdateProductUseCaseResponse> {
    // Verificar se o produto existe
    const existingProduct = await this.productsRepository.findById(productId);

    if (!existingProduct) {
      throw new ResourceNotFoundError();
    }

    // Verificar se o produto pertence ao produtor
    if (existingProduct.producerId !== producerId) {
      throw new Error("You can only update your own products");
    }

    const product = await this.productsRepository.update(productId, {
      title,
      description,
      price,
      category,
      quantity,
    });

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