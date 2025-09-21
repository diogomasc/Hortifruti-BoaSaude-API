import { DrizzleAddressesRepository } from "../../repositories/drizzle-addresses-repository";
import { CreateAddressUseCase } from "../create-address";

export function makeCreateAddressUseCase() {
  const addressesRepository = new DrizzleAddressesRepository();
  const createAddressUseCase = new CreateAddressUseCase(addressesRepository);

  return createAddressUseCase;
}