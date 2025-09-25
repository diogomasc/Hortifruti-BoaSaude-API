import type { UsersRepository } from "../repositories/users-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { ToggleUserActiveStatusRequest, ToggleUserActiveStatusResponse } from "../types";

// Type aliases for backward compatibility
type ToggleUserActiveStatusUseCaseRequest = ToggleUserActiveStatusRequest;
type ToggleUserActiveStatusUseCaseResponse = ToggleUserActiveStatusResponse;

export class ToggleUserActiveStatusUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    isActive,
  }: ToggleUserActiveStatusUseCaseRequest): Promise<ToggleUserActiveStatusUseCaseResponse> {
    const existingUser = await this.usersRepository.findById(userId);

    if (!existingUser) {
      throw new ResourceNotFoundError();
    }

    const user = await this.usersRepository.updateActiveStatus(userId, isActive);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    };
  }
}