import type { ProductsRepository } from "../repositories/products-repository";
import { ListProductsRequest, ListProductsResponse } from "../types";

// Type aliases for backward compatibility
type ListProductsUseCaseRequest = ListProductsRequest;
type ListProductsUseCaseResponse = ListProductsResponse;


export class ListProductsUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    page = 1,
    limit = 10,
    search,
    category,
    producerId,
  }: ListProductsUseCaseRequest): Promise<ListProductsUseCaseResponse> {
    const { products, total } = await this.productsRepository.findMany({
      page,
      limit,
      search,
      category,
      producerId,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      products: products.map((product) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        producerId: product.producerId,
        quantity: product.quantity,
        createdAt: product.createdAt,
        images: product.images,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}