import type { ProductsRepository } from "../repositories/products-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import type { UsersRepository } from "../repositories/users-repository";
import type { CreateProductRequest, CreateProductResponse } from "../types";

// Use centralized types
type CreateProductUseCaseRequest = CreateProductRequest;
type CreateProductUseCaseResponse = CreateProductResponse;

export class CreateProductUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private usersRepository: UsersRepository
  ) {}

  async execute({
    title,
    description,
    price,
    category,
    producerId,
    quantity,
  }: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
    // Verificar se o usuário existe e é um produtor
    const user = await this.usersRepository.findById(producerId);

    if (!user) {
      throw new ResourceNotFoundError();
    }

    if (user.role !== "producer") {
      throw new Error("Only producers can create products");
    }

    const product = await this.productsRepository.create({
      title,
      description,
      price,
      category,
      producerId,
      quantity,
    });

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