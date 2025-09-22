export class InvalidRoleError extends Error {
  constructor(message = "Papel de usuário inválido") {
    super(message);
    this.name = "InvalidRoleError";
  }
}