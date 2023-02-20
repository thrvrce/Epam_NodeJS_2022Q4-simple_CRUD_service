import { createLogger, format, transports, Logger } from 'winston'
import { Request, NextFunction } from 'express'

const createControllerLogger = (controllerName: string) => createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { controller: controllerName },
  transports: [
    new transports.File({ filename: `logs/${controllerName}.controller.errors.log`, level: 'error' }),
    new transports.File({ filename: `logs/${controllerName}.controller.combined.log` }),
    new transports.Console()
  ]
})

export const usersControllerLogger = createControllerLogger('users')
export const groupsControllerLogger = createControllerLogger('groups')
export const userGroupsControllerLogger = createControllerLogger('userGroups')

export const logControllerInfo = (logger: Logger) => (req: Request, _: unknown, next: NextFunction) => {
  logger.log({
    level: 'info',
    message: `Controller ${logger.defaultMeta.controller as string} call log`,
    requestMethod: req.method,
    requestParams: req.params,
    requestQueryStringParams: req.query,
    requestBody: req.body
  })
  next()
}

export const logControllerError = (logger: Logger) => (error: unknown, req: Request, _: unknown, next: NextFunction) => {
  logger.log({
    level: 'error',
    message: `Controller ${logger.defaultMeta.controller as string} error log`,
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
