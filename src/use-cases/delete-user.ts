import type { UsersRepository } from "../repositories/users-repository";
import type { WalletsRepository } from "../repositories/wallets-repository";
import type { AddressesRepository } from "../repositories/addresses-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { DeleteUserRequest } from "../types";

// Type alias for backward compatibility
type DeleteUserUseCaseRequest = DeleteUserRequest;

export class DeleteUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private walletsRepository: WalletsRepository,
    private addressesRepository: AddressesRepository
  ) {}

  async execute({ userId }: DeleteUserUseCaseRequest): Promise<void> {
    const existingUser = await this.usersRepository.findById(userId);

    if (!existingUser) {
      throw new ResourceNotFoundError();
    }

    // Deletar wallet se existir (para produtores)
    const wallet = await this.walletsRepository.findByUserId(userId);
    if (wallet) {
      await this.walletsRepository.delete(wallet.id);
    }

    // Deletar endereços
    const addresses = await this.addressesRepository.findByUserId(userId);
    for (const address of addresses) {
      await this.addressesRepository.delete(address.id);
    }

    // Deletar usuário
    await this.usersRepository.delete(userId);
  }
}