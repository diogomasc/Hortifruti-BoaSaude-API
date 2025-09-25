// Common and utility types
import { UserRole, Frequency, OrderDirection } from "../constants";

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationWithOffset {
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SearchParams {
  search?: string;
  limit?: number;
  offset?: number;
}

// Generic repository interfaces
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Repository<T, CreateData, UpdateData = Partial<CreateData>> {
  findById(id: string): Promise<T | null>;
  create(data: CreateData): Promise<T>;
  update(id: string, data: UpdateData): Promise<T | null>;
  delete(id: string): Promise<void>;
}

// Error types
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

// JWT payload type
export interface JWTPayload {
  sub: string; // user id
  role: UserRole;
  iat?: number;
  exp?: number;
}

// File upload types
export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  file: NodeJS.ReadableStream;
}

export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
}

// Recurrence types
export interface RecurrenceData {
  isRecurring: boolean;
  frequency?: Frequency;
  customDays?: number;
  nextDeliveryDate?: Date;
}

// Generic use case interfaces
export interface UseCase<Request, Response> {
  execute(request: Request): Promise<Response>;
}

// Database query helpers
export interface FindManyParams extends PaginationParams {
  search?: string;
  filters?: Record<string, any>;
  orderBy?: string;
  orderDirection?: OrderDirection;
}

export interface FindManyResult<T> {
  items: T[];
  total: number;
  pagination: PaginationResponse;
}

// Wallet types
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
