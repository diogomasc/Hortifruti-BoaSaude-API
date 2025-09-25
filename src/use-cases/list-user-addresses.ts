import type { AddressesRepository } from "../repositories/addresses-repository";

interface ListUserAddressesUseCaseRequest {
  userId: string;
  search?: string;
  limit?: number;
  offset?: number;
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
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
  };
}

export class ListUserAddressesUseCase {
  constructor(private addressesRepository: AddressesRepository) {}

  async execute({
    userId,
    search,
    limit = 12,
    offset = 0,
  }: ListUserAddressesUseCaseRequest): Promise<ListUserAddressesUseCaseResponse> {
    let addresses = await this.addressesRepository.findByUserId(userId);

    // Aplicar filtro de busca se fornecido
    if (search) {
      const searchLower = search.toLowerCase();
      addresses = addresses.filter(address => 
        address.street.toLowerCase().includes(searchLower) ||
        address.city.toLowerCase().includes(searchLower) ||
        address.state.toLowerCase().includes(searchLower) ||
        (address.complement && address.complement.toLowerCase().includes(searchLower))
      );
    }

    // Calcular paginação
    const total = addresses.length;
    const paginatedAddresses = addresses.slice(offset, offset + limit);
    const hasNext = offset + limit < total;

    return {
      addresses: paginatedAddresses,
      pagination: {
        total,
        limit,
        offset,
        hasNext,
      },
    };
  }
}