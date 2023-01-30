type ErrorWithStatus = Error & { status: number }

const createHttpError = (status: number, message: string, cause?: Error): ErrorWithStatus => {
  const error = new Error(message, cause?.message !== undefined ? { cause: cause.message } : undefined) as ErrorWithStatus
  error.status = status
  return error
}

export const isErrorWithStatus = (error: unknown): error is ErrorWithStatus => error instanceof Error && 'status' in error

export default createHttpError
