import { Wallet, CreateWalletData } from '../types';

export interface WalletsRepository {
  findByUserId(userId: string): Promise<Wallet | null>;
  create(data: CreateWalletData): Promise<Wallet>;
  updateBalance(userId: string, balance: string): Promise<Wallet>;
  delete(id: string): Promise<void>;
}