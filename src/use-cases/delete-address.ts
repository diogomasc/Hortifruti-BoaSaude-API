import type { AddressesRepository } from "../repositories/addresses-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { DeleteAddressRequest } from "../types";

// Type alias for backward compatibility
type DeleteAddressUseCaseRequest = DeleteAddressRequest;

export class DeleteAddressUseCase {
  constructor(private addressesRepository: AddressesRepository) {}

  async execute({
    addressId,
    userId,
  }: DeleteAddressUseCaseRequest): Promise<void> {
    // Verifica se o endereço existe e pertence ao usuário
    const existingAddress = await this.addressesRepository.findByIdAndUserId(
      addressId,
      userId
    );

    if (!existingAddress) {
      throw new ResourceNotFoundError();
    }

    await this.addressesRepository.delete(addressId);
  }
}