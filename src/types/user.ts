// User-related types
import { UserRole } from '../constants';

export type { UserRole };

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  cnpj?: string;
  shopName?: string;
  shopDescription?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  cnpj?: string;
  shopName?: string;
  shopDescription?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  cnpj?: string;
  shopName?: string;
  shopDescription?: string;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  cnpj?: string;
  shopName?: string;
  shopDescription?: string;
}

// Use case request/response types
export interface GetUserProfileRequest {
  userId: string;
}

export interface GetUserProfileResponse {
  user: UserProfile;
}

export interface AuthenticateRequest {
  email: string;
  password: string;
}

export interface AuthenticateResponse {
  user: UserProfile;
  token: string;
}

export interface GetUserCompleteProfileRequest {
  userId: string;
}

export interface GetUserCompleteProfileResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    phone?: string;
    cpf?: string;
    birthDate?: string;
    cnpj?: string;
    shopName?: string;
    shopDescription?: string;
    isActive: boolean;
    createdAt: Date;
    wallet?: {
      id: string;
      balance: string;
      updatedAt: Date;
    };
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
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  cnpj?: string;
  shopName?: string;
  shopDescription?: string;
}

export interface RegisterResponse {
  user: UserProfile;
}

export interface UpdateUserProfileRequest {
  userId: string;
  data: UpdateUserData;
}

export interface UpdateUserProfileResponse {
  user: UserProfile;
}

export interface ToggleUserActiveStatusRequest {
  userId: string;
  isActive: boolean;
}

export interface ToggleUserActiveStatusResponse {
  user: UserProfile;
}

export interface DeleteUserRequest {
  userId: string;
}