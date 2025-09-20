export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: "consumer" | "producer" | "admin";
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
  role: "consumer" | "producer";
  firstName: string;
  lastName: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  cnpj?: string;
  shopName?: string;
  shopDescription?: string;
}

export interface UsersRepository {
  findByEmail(email: string): Promise<User | null>;
  findByCpf(cpf: string): Promise<User | null>;
  findByCnpj(cnpj: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}