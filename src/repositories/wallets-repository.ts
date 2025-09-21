export interface Wallet {
  id: string;
  userId: string;
  balance: string;
  updatedAt: Date;
}

export interface CreateWalletData {
  userId: string;
  balance?: string;
}

export interface WalletsRepository {
  findByUserId(userId: string): Promise<Wallet | null>;
  create(data: CreateWalletData): Promise<Wallet>;
  updateBalance(userId: string, balance: string): Promise<Wallet>;
  delete(id: string): Promise<void>;
}