import { User, CreateUserData, UserRole } from '../types';

export interface UsersRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCpf(cpf: string): Promise<User | null>;
  findByCnpj(cnpj: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: Partial<CreateUserData>): Promise<User>;
  updateActiveStatus(id: string, isActive: boolean): Promise<User>;
  delete(id: string): Promise<void>;
}