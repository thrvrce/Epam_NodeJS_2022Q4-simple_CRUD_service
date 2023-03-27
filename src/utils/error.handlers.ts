import { NextFunction, Response, Request } from 'express'
import { isErrorWithStatus } from './createHttpError'
import { uncaughtExceptionLogger, uncaughtRejectionLogger } from './logger'

export const defaultUnhandledErrorhandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (isErrorWithStatus(err)) {
    res.status(err.status)
    res.json({ message: err.message, cause: err.cause })
  } else {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500)
    res.json({ message })
  }
}

export const uncaughtExceptionErrorHandler = (error: unknown) => {
  uncaughtExceptionLogger.log({ level: 'error', message: 'uncaught exception error', error })
}

export const unhandledRejectionErrorHandler = (error: unknown) => {
  uncaughtRejectionLogger.log({ level: 'error', message: 'uncaught promise rejection error', error })
}
