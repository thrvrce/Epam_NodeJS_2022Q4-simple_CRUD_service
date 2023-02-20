import { createLogger, format, transports, Logger } from 'winston'
import { Request, NextFunction } from 'express'

const createServiceLogger = (serviceName: string) => createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: serviceName },
  transports: [
    new transports.File({ filename: `logs/${serviceName}.service.errors.log`, level: 'error' }),
    new transports.File({ filename: `logs/${serviceName}.service.combined.log` })
  ]
})

export const usersServiceLogger = createServiceLogger('users')
export const groupsServiceLogger = createServiceLogger('groups')
export const userGroupsServiceLogger = createServiceLogger('userGroups')

export const logServiceInfo = (logger: Logger) => (req: Request, _: unknown, next: NextFunction) => {
  logger.log({
    level: 'info',
    message: `service ${logger.defaultMeta.service as string} call log`,
    requestMethod: req.method,
    requestParams: req.params,
    requestQueryStringParams: req.query,
    requestBody: req.body
  })
  next()
}

export const logServiceError = (logger: Logger) => (error: unknown, req: Request, _: unknown, next: NextFunction) => {
  logger.log({
    level: 'error',
    message: `service ${logger.defaultMeta.service as string} error log`,
    requestMethod: req.method,
    requestParams: req.params,
    requestQueryStringParams: req.query,
    requestBody: req.body,
    errorMessage: typeof error === 'object' && (error != null) && 'message' in error ? error.message : 'unknown error',
    error
  })
  next(error)
}

export const uncaughtExceptionLogger = createLogger({
  level: 'error',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/uncaughtException.errors.log', level: 'error' })
  ]
})

export const uncaughtRejectionLogger = createLogger({
  level: 'error',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/uncaughtRejection.errors.log', level: 'error' })
  ]
})
