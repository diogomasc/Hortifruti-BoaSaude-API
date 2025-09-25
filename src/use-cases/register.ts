import { hash } from "argon2";
import type { UsersRepository } from "../repositories/users-repository";
import type { WalletsRepository } from "../repositories/wallets-repository";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";
import type { RegisterRequest, RegisterResponse } from "../types";

// Use centralized types
type RegisterUseCaseRequest = RegisterRequest;
type RegisterUseCaseResponse = RegisterResponse;

export class RegisterUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private walletsRepository: WalletsRepository
  ) {}

  async execute({
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
    cpf,
    birthDate,
    cnpj,
    shopName,
    shopDescription,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    // Verificar se email já existe
    const userWithSameEmail = await this.usersRepository.findByEmail(email);
    if (userWithSameEmail) {
      throw new UserAlreadyExistsError();
    }

    // Verificar CPF para consumidores
    if (role === "consumer" && cpf) {
      const userWithSameCpf = await this.usersRepository.findByCpf(cpf);
      if (userWithSameCpf) {
        throw new UserAlreadyExistsError();
      }
    }

    // Verificar CNPJ para produtores
    if (role === "producer" && cnpj) {
      const userWithSameCnpj = await this.usersRepository.findByCnpj(cnpj);
      if (userWithSameCnpj) {
        throw new UserAlreadyExistsError();
      }
    }

    // Hash da senha
    const passwordHash = await hash(password);

    // Criar usuário
    const user = await this.usersRepository.create({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      role,
      cpf,
      birthDate,
      cnpj,
      shopName,
      shopDescription,
    });

    // Criar wallet automaticamente se for produtor
    if (role === "producer") {
      await this.walletsRepository.create({
        userId: user.id,
        balance: "0",
      });
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