import { DrizzleUsersRepository } from "../../repositories/drizzle-users-repository";
import { UpdateUserProfileUseCase } from "../update-user-profile";

export function makeUpdateUserProfileUseCase() {
  const usersRepository = new DrizzleUsersRepository();
  
  const updateUserProfileUseCase = new UpdateUserProfileUseCase(usersRepository);

  return updateUserProfileUseCase;
}