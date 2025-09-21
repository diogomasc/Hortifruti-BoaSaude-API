import type { AddressesRepository } from "../repositories/addresses-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface DeleteAddressUseCaseRequest {
  addressId: string;
  userId: string;
}

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