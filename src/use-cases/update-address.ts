import type { AddressesRepository } from "../repositories/addresses-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { UpdateAddressRequest, UpdateAddressResponse } from "../types";

// Type aliases for backward compatibility
type UpdateAddressUseCaseRequest = UpdateAddressRequest;
type UpdateAddressUseCaseResponse = UpdateAddressResponse;

export class UpdateAddressUseCase {
  constructor(private addressesRepository: AddressesRepository) {}

  async execute({
    addressId,
    userId,
    street,
    number,
    complement,
    city,
    state,
    country,
    zipCode,
  }: UpdateAddressUseCaseRequest): Promise<UpdateAddressUseCaseResponse> {
    // Verifica se o endereço existe e pertence ao usuário
    const existingAddress = await this.addressesRepository.findByIdAndUserId(
      addressId,
      userId
    );

    if (!existingAddress) {
      throw new ResourceNotFoundError();
    }

    const address = await this.addressesRepository.update(addressId, {
      userId,
      street,
      number,
      complement,
      city,
      state,
      country,
      zipCode,
    });

    return {
      address,
    };
  }
}