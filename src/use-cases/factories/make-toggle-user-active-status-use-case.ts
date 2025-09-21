import { DrizzleUsersRepository } from "../../repositories/drizzle-users-repository";
import { ToggleUserActiveStatusUseCase } from "../toggle-user-active-status";

export function makeToggleUserActiveStatusUseCase() {
  const usersRepository = new DrizzleUsersRepository();
  
  const toggleUserActiveStatusUseCase = new ToggleUserActiveStatusUseCase(usersRepository);

  return toggleUserActiveStatusUseCase;
}