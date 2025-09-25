import type { ProductsRepository } from "../repositories/products-repository";
import type { UsersRepository } from "../repositories/users-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { ListProducerProductsRequest, ListProducerProductsResponse } from "../types";

// Type aliases for backward compatibility
type ListProducerProductsUseCaseRequest = ListProducerProductsRequest;
type ListProducerProductsUseCaseResponse = ListProducerProductsResponse;

export class ListProducerProductsUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private usersRepository: UsersRepository
  ) {}

  async execute({
    producerId,
  }: ListProducerProductsUseCaseRequest): Promise<ListProducerProductsUseCaseResponse> {
    // Verificar se o usuário existe e é um produtor
    const user = await this.usersRepository.findById(producerId);

    if (!user) {
      throw new ResourceNotFoundError();
    }

    if (user.role !== "producer") {
      throw new Error("User is not a producer");
    }

    const products = await this.productsRepository.findByProducerId(producerId);

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
    };
  }
}