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
export const logServiceWithPassedParams = (logger: Logger) => (req: Request, _: unknown, next: NextFunction) => {
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
