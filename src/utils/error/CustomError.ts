export class CustomError extends Error {
  public code: number;

  constructor(message: string, code: number = 500) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
