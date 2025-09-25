import type { UsersRepository } from "../repositories/users-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";
import { UpdateUserProfileRequest, UpdateUserProfileResponse } from "../types";

// Type aliases for backward compatibility
type UpdateUserProfileUseCaseRequest = UpdateUserProfileRequest;
type UpdateUserProfileUseCaseResponse = UpdateUserProfileResponse;


export class UpdateUserProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    data: {
      email,
      firstName,
      lastName,
      phone,
      cpf,
      birthDate,
      cnpj,
      shopName,
      shopDescription,
    },
  }: UpdateUserProfileUseCaseRequest): Promise<UpdateUserProfileUseCaseResponse> {
    const existingUser = await this.usersRepository.findById(userId);

    if (!existingUser) {
      throw new ResourceNotFoundError();
    }

    // Verificar se email já existe (se foi alterado)
    if (email && email !== existingUser.email) {
      const userWithSameEmail = await this.usersRepository.findByEmail(email);
      if (userWithSameEmail) {
        throw new UserAlreadyExistsError();
      }
    }

    // Verificar CPF para consumidores (se foi alterado)
    if (cpf && cpf !== existingUser.cpf && existingUser.role === "consumer") {
      const userWithSameCpf = await this.usersRepository.findByCpf(cpf);
      if (userWithSameCpf) {
        throw new UserAlreadyExistsError();
      }
    }

    // Verificar CNPJ para produtores (se foi alterado)
    if (cnpj && cnpj !== existingUser.cnpj && existingUser.role === "producer") {
      const userWithSameCnpj = await this.usersRepository.findByCnpj(cnpj);
      if (userWithSameCnpj) {
        throw new UserAlreadyExistsError();
      }
    }

    const user = await this.usersRepository.update(userId, {
      email,
      firstName,
      lastName,
      phone,
      cpf,
      birthDate,
      cnpj,
      shopName,
      shopDescription,
    });

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