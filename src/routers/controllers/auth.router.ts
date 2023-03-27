import { Router } from 'express'

import { isError } from '../../utils/checkers'
import createHttpError from '../../utils/createHttpError'
import { login } from '../../services/auth.service'

export const authRouter = Router()

authRouter.post('/login', (req, res, next) => {
  login(req.body)
    .then(
      ({ statusCode, payload }) => {
        res.status(statusCode).json(payload)
      }
    )
    .catch((error: unknown) => {
      next(createHttpError(500, 'Internal Server Error', isError(error) ? error : undefined))
    })
})
