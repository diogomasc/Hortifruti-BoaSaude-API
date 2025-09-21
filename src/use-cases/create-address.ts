import type { AddressesRepository } from "../repositories/addresses-repository";

interface CreateAddressUseCaseRequest {
  userId: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface CreateAddressUseCaseResponse {
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