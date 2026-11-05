const FATAL_STATUS = new Set([401, 403, 404]);

/** The AI SDK wraps exhausted retries in a `RetryError` that carries the last failure. */
const unwrap = (error: any) => error?.lastError ?? error;

/**
 * Authentication and unknown model errors fail every request the same way, so the whole run
 * stops instead of reporting the same error for each file.
 */
export const isFatalError = (error: unknown): boolean => {
  const cause = unwrap(error);
  return FATAL_STATUS.has(cause?.statusCode ?? cause?.status);
};

export const getErrorMessage = (error: unknown): string => {
  const cause = unwrap(error);
  return String(cause?.message || cause || 'unknown error');
};
