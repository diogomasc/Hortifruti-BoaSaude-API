import type { AddressesRepository } from "../repositories/addresses-repository";

interface ListUserAddressesUseCaseRequest {
  userId: string;
}

interface ListUserAddressesUseCaseResponse {
  addresses: {
    id: string;
    userId: string;
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  }[];
}

export class ListUserAddressesUseCase {
  constructor(private addressesRepository: AddressesRepository) {}

  async execute({
    userId,
  }: ListUserAddressesUseCaseRequest): Promise<ListUserAddressesUseCaseResponse> {
    const addresses = await this.addressesRepository.findByUserId(userId);

    return {
      addresses,
    };
  }
}