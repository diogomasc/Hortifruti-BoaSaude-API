import { DrizzleUsersRepository } from "../../repositories/drizzle-users-repository";
import { DrizzleWalletsRepository } from "../../repositories/drizzle-wallets-repository";
import { DrizzleAddressesRepository } from "../../repositories/drizzle-addresses-repository";
import { DeleteUserUseCase } from "../delete-user";

export function makeDeleteUserUseCase() {
  const usersRepository = new DrizzleUsersRepository();
  const walletsRepository = new DrizzleWalletsRepository();
  const addressesRepository = new DrizzleAddressesRepository();
  
  const deleteUserUseCase = new DeleteUserUseCase(
    usersRepository,
    walletsRepository,
    addressesRepository
  );

  return deleteUserUseCase;
}