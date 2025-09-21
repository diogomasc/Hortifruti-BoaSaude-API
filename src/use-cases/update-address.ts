import type { AddressesRepository } from "../repositories/addresses-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface UpdateAddressUseCaseRequest {
  addressId: string;
  userId: string;
  street?: string;
  number?: string;
  complement?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

interface UpdateAddressUseCaseResponse {
  address: {
    id: string;
    userId: string;
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

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