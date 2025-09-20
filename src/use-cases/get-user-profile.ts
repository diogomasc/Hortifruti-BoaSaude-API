import type { UsersRepository } from "../repositories/users-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface GetUserProfileUseCaseRequest {
  userId: string;
}

interface GetUserProfileUseCaseResponse {
  user: {
    id: string;
    email: string;
    role: "consumer" | "producer" | "admin";
    firstName: string;
    lastName: string;
    phone?: string;
    cpf?: string;
    birthDate?: string;
    cnpj?: string;
    shopName?: string;
    shopDescription?: string;
    isActive: boolean;
    createdAt: Date;
  };
}

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