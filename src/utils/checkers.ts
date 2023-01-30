import Joi from 'joi'
import { NewUserConfig } from 'models/user.model'

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
