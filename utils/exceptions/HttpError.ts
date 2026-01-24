class HttpError extends Error {
  status;
  errors;

  constructor(status: number, message: string, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static Unauthorized(message: string = "Unathorized") {
    return new HttpError(401, message);
  }

  static NotFound(message: string) {
    return new HttpError(404, message);
  }

  static BadRequest(message: string) {
    return new HttpError(400, message);
  }
}

export default HttpError;