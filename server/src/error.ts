export class MaxAttunementsExceededError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "MaxAttunementsExceededError";
  }
}
