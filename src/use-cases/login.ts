import { verify } from "argon2";
import { sign } from "jsonwebtoken";
import type { UsersRepository } from "../repositories/users-repository";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";
import { env } from "../env";

interface AuthenticateUseCaseRequest {
  email: string;
  password: string;
}

interface AuthenticateUseCaseResponse {
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
  token: string;
}

export class AuthenticateUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      throw new InvalidCredentialsError();
    }

    const doesPasswordMatches = await this.doesPasswordMatches(
      password,
      user.passwordHash
    );

    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError();
    }

    const token = sign(
      {
        sub: user.id,
        role: user.role,
      },
      env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

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
      token,
    };
  }

  private async doesPasswordMatches(
    password: string,
    passwordHash: string
  ): Promise<boolean> {
    return await verify(passwordHash, password);
  }
}