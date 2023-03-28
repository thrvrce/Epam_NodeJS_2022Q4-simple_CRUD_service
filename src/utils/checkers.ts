import Joi from 'joi'
import jwt from 'jsonwebtoken'

import { NewUserConfig } from '../models/users.model'
import { NewGroupConfig, GroupPermissions } from '../models/groups.model'
import { Request, Response, NextFunction } from 'express'
import { secret } from '../services/auth.service'

export const isNotNullish = <T>(payload: T | null | undefined): payload is T => payload !== undefined && payload !== null

export const isError = (error: unknown): error is Error => error instanceof Error

export const isValidCreateUserBody = Joi.object<NewUserConfig>().keys({
  login: Joi
    .string()
    .alphanum()
    .min(1)
    .max(30)
    .required(),
  password: Joi
    .string()
    .regex(/[a-z]{1,}/)
    .regex(/[A-Z]{1,}/)
    .regex(/[0-9]{1,}/)
    .required(),
  age: Joi
    .number()
    .min(4)
    .max(130)
    .required(),
  isDeleted: Joi
    .boolean()
    .required()
})

export const isValidUpdateUserBody = isValidCreateUserBody

export const isValidCreateGroupBody = Joi.object<NewGroupConfig>().keys({
  name: Joi
    .string()
    .alphanum()
    .min(1)
    .max(30)
    .required(),
  permissions: Joi
    .array()
    .items(Joi.string().required().valid(
      GroupPermissions.delete, GroupPermissions.read, GroupPermissions.share, GroupPermissions.uploadFiles, GroupPermissions.write))
})

export const isValidUpdateGroupBody = isValidCreateGroupBody

export const checkAuthorizationHeader = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === '/login') {
    return next()
  }

  const token = req.header('Authorization')

  if (token === undefined) {
    return res.status(401).send({ success: false, message: 'no token provided' })
  }

  jwt.verify(token, secret, (err) => {
    if (err != null) {
      return res.status(403).send({ success: false, message: 'Failed to authenticate token' })
    }

    next()
  })
}
