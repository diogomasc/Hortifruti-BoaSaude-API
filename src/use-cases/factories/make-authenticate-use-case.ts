import { DrizzleUsersRepository } from "../../repositories/drizzle-users-repository";
import { AuthenticateUseCase } from "../login";

export function makeAuthenticateUseCase() {
  const usersRepository = new DrizzleUsersRepository();
  const authenticateUseCase = new AuthenticateUseCase(usersRepository);

  return authenticateUseCase;
}