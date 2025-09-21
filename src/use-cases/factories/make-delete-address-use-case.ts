import { DrizzleAddressesRepository } from "../../repositories/drizzle-addresses-repository";
import { DeleteAddressUseCase } from "../delete-address";

export function makeDeleteAddressUseCase() {
  const addressesRepository = new DrizzleAddressesRepository();
  const deleteAddressUseCase = new DeleteAddressUseCase(addressesRepository);

  return deleteAddressUseCase;
}