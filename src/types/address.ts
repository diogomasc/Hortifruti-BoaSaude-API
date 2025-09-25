// Address-related types

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

export interface UpdateAddressData {
  street?: string;
  number?: string;
  complement?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

// Use case request/response types
export interface CreateAddressRequest {
  userId: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface CreateAddressResponse {
  address: Address;
}

export interface UpdateAddressRequest {
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

export interface UpdateAddressResponse {
  address: Address;
}

export interface DeleteAddressRequest {
  addressId: string;
  userId: string;
}

export interface ListUserAddressesRequest {
  userId: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListUserAddressesResponse {
  addresses: Address[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
  };
}