export class InvalidStatusTransitionError extends Error {
  constructor(message?: string) {
    super(message || "Invalid status transition");
    this.name = "InvalidStatusTransitionError";
  }
}