import type { UsersRepository } from "../repositories/users-repository";
import type { WalletsRepository } from "../repositories/wallets-repository";
import type { AddressesRepository } from "../repositories/addresses-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { GetUserCompleteProfileRequest, GetUserCompleteProfileResponse } from "../types";

// Type aliases for backward compatibility
type GetUserCompleteProfileUseCaseRequest = GetUserCompleteProfileRequest;
type GetUserCompleteProfileUseCaseResponse = GetUserCompleteProfileResponse;

export class GetUserCompleteProfileUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private walletsRepository: WalletsRepository,
    private addressesRepository: AddressesRepository
  ) {}

  async execute({
    userId,
  }: GetUserCompleteProfileUseCaseRequest): Promise<GetUserCompleteProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new ResourceNotFoundError();
    }

    // Buscar wallet se for produtor
    let wallet = undefined;
    if (user.role === "producer") {
      const userWallet = await this.walletsRepository.findByUserId(userId);
      if (userWallet) {
        wallet = {
          id: userWallet.id,
          balance: userWallet.balance,
          updatedAt: userWallet.updatedAt,
        };
      }
    }

    // Buscar endereços
    const userAddresses = await this.addressesRepository.findByUserId(userId);
    const addresses = userAddresses.map((address) => ({
      id: address.id,
      userId: address.userId,
      street: address.street,
      number: address.number,
      complement: address.complement,
      city: address.city,
      state: address.state,
      country: address.country,
      zipCode: address.zipCode,
    }));

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
        wallet,
        addresses,
      },
    };
  }
}
