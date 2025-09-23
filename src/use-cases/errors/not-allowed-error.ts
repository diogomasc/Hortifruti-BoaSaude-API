export class NotAllowedError extends Error {
  constructor(message: string = "Not allowed") {
    super(message);
    this.name = "NotAllowedError";
  }
}