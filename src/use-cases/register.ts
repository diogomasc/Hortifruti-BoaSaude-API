import { hash } from "argon2";
import type { UsersRepository } from "../repositories/users-repository";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";

interface RegisterUseCaseRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "consumer" | "producer" | "admin";
  cpf?: string;
  birthDate?: string;
  cnpj?: string;
  shopName?: string;
  shopDescription?: string;
}

interface RegisterUseCaseResponse {
  user: {
    id: string;
    email: string;
    role: "consumer" | "producer" | "admin";
    firstName: string;
    lastName: string;
    createdAt: Date;
  };
}

export class RegisterUseCase {
  constructor(private usersRepository: UsersRepository) {}

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

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
    };
  }
}