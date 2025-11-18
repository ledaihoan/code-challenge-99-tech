export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE';

export class ApiError extends Error {
  public status: number;
  public code: ErrorCode;
  public details?: unknown;

  constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Shorthand factory helpers
export const BadRequestException = (message: string, details?: unknown) =>
  new ApiError(400, 'VALIDATION_ERROR', message, details);
export const UnauthorizedException = (message = 'Unauthorized') =>
  new ApiError(401, 'UNAUTHORIZED', message);
export const NotFoundException = (message = 'Not found') => new ApiError(404, 'NOT_FOUND', message);
export const ConflictException = (message = 'Conflict') => new ApiError(409, 'CONFLICT', message);
export const InternalServerException = (message = 'Internal Server Error', details?: unknown) =>
  new ApiError(500, 'INTERNAL_SERVER_ERROR', message, details);

export const ServerUnavailableException = (message = 'Server Unavailable') =>
  new ApiError(503, 'SERVICE_UNAVAILABLE', message);

// Consistent error payload
export const toErrorPayload = (err: ApiError, requestId?: string) => ({
  error: {
    code: err.code,
    message: err.message,
    details: err.details,
    requestId,
  },
});
