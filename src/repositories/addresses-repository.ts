export interface Address {
  id: string;
  userId: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface CreateAddressData {
  userId: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface AddressesRepository {
  findByUserId(userId: string): Promise<Address[]>;
  findByIdAndUserId(id: string, userId: string): Promise<Address | null>;
  create(data: CreateAddressData): Promise<Address>;
  update(id: string, data: Partial<CreateAddressData>): Promise<Address>;
  delete(id: string): Promise<void>;
}