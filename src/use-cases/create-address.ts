import type { AddressesRepository } from "../repositories/addresses-repository";
import { CreateAddressRequest, CreateAddressResponse } from "../types";

// Type aliases for backward compatibility
type CreateAddressUseCaseRequest = CreateAddressRequest;
type CreateAddressUseCaseResponse = CreateAddressResponse;

export class CreateAddressUseCase {
  constructor(private addressesRepository: AddressesRepository) {}

  async execute({
    userId,
    street,
    number,
    complement,
    city,
    state,
    country,
    zipCode,
  }: CreateAddressUseCaseRequest): Promise<CreateAddressUseCaseResponse> {
    const address = await this.addressesRepository.create({
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