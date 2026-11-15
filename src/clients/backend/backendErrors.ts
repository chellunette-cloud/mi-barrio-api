export class BackendError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'BackendError';
  }
}

export class BackendTimeoutError extends Error {
  constructor() {
    super('El backend interno agotó el tiempo de espera');
    this.name = 'BackendTimeoutError';
  }
}
