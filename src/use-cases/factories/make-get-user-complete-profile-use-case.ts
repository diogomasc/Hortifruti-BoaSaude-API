import { DrizzleUsersRepository } from "../../repositories/drizzle-users-repository";
import { DrizzleWalletsRepository } from "../../repositories/drizzle-wallets-repository";
import { DrizzleAddressesRepository } from "../../repositories/drizzle-addresses-repository";
import { GetUserCompleteProfileUseCase } from "../get-user-complete-profile";

export function makeGetUserCompleteProfileUseCase() {
  const usersRepository = new DrizzleUsersRepository();
  const walletsRepository = new DrizzleWalletsRepository();
  const addressesRepository = new DrizzleAddressesRepository();
  
  const getUserCompleteProfileUseCase = new GetUserCompleteProfileUseCase(
    usersRepository,
    walletsRepository,
    addressesRepository
  );

  return getUserCompleteProfileUseCase;
}