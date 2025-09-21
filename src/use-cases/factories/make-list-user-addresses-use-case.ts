import { DrizzleAddressesRepository } from "../../repositories/drizzle-addresses-repository";
import { ListUserAddressesUseCase } from "../list-user-addresses";

export function makeListUserAddressesUseCase() {
  const addressesRepository = new DrizzleAddressesRepository();
  const listUserAddressesUseCase = new ListUserAddressesUseCase(addressesRepository);

  return listUserAddressesUseCase;
}