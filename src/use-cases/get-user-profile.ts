import type { UsersRepository } from "../repositories/users-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { GetUserProfileRequest, GetUserProfileResponse } from "../types";

// Type aliases for backward compatibility
type GetUserProfileUseCaseRequest = GetUserProfileRequest;
type GetUserProfileUseCaseResponse = GetUserProfileResponse;

export class GetUserProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
  }: GetUserProfileUseCaseRequest): Promise<GetUserProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new ResourceNotFoundError();
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        cpf: user.cpf,
        birthDate: user.birthDate,
        cnpj: user.cnpj,
        shopName: user.shopName,
        shopDescription: user.shopDescription,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    };
  }
}