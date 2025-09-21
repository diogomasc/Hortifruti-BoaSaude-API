import { DrizzleAddressesRepository } from "../../repositories/drizzle-addresses-repository";
import { UpdateAddressUseCase } from "../update-address";

export function makeUpdateAddressUseCase() {
  const addressesRepository = new DrizzleAddressesRepository();
  const updateAddressUseCase = new UpdateAddressUseCase(addressesRepository);

  return updateAddressUseCase;
}