import { Address, CreateAddressData } from '../types';

export interface AddressesRepository {
  findById(id: string): Promise<Address | null>;
  findByUserId(userId: string): Promise<Address[]>;
  findByIdAndUserId(id: string, userId: string): Promise<Address | null>;
  create(data: CreateAddressData): Promise<Address>;
  update(id: string, data: Partial<CreateAddressData>): Promise<Address>;
  delete(id: string): Promise<void>;
}