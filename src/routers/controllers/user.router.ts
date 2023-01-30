import { Router } from 'express'
import {
  createNewUser,
  deleteUserById,
  getAllUsers, getAutoSuggestUsers, getUserById, patchUserById

} from '../../services/user.service'
import createHttpError from '../../utils/createHttpError'
import { isError, isNotNullish } from '../../utils/checkers'

export const userRouter = Router()

userRouter.get('/', (req, res, next) => {
  getAllUsers()
    .then(({ statusCode, payload }) => {
      res.status(statusCode).json(payload)
    })
    .catch((error: unknown) => {
      next(createHttpError(500, 'Internal Server Error', isError(error) ? error : undefined))
    })
})

userRouter.get('/user/:userId', (req, res, next) => {
  getUserById(req.params.userId)
    .then(({ statusCode, payload }) => {
      res.status(statusCode).json(payload)
    })
    .catch((error: unknown) => {
      next(createHttpError(500, 'Internal Server Error', isError(error) ? error : undefined))
    })
})

userRouter.post('/user', (req, res, next) => {
  createNewUser(req.body)
    .then(({ statusCode, payload }) => {
      res.status(statusCode).json(payload)
    })
    .catch((error: unknown) => {
      next(createHttpError(500, 'Internal Server Error', isError(error) ? error : undefined))
    })
})

userRouter.put('/user/:userId', (req, res, next) => {
  patchUserById(req.params.userId, req.body)
    .then(({ statusCode, payload }) => {
      res.status(statusCode).json(payload)
    })
    .catch((error: unknown) => {
      next(createHttpError(500, 'Internal Server Error', isError(error) ? error : undefined))
    })
})

userRouter.delete('/user/:userId', (req, res, next) => {
  deleteUserById(req.params.userId)
    .then(({ statusCode, payload }) => {
      res.status(statusCode).json(payload)
    })
    .catch((error: unknown) => {
      next(createHttpError(500, 'Internal Server Error', isError(error) ? error : undefined))
    })
})

userRouter.get('/AutoSuggestUsers', (req, res, next) => {
  const { query: { limit, loginSubstring } } = req

  if (isNotNullish(limit) && typeof limit === 'string' && isNotNullish(loginSubstring) && typeof loginSubstring === 'string') {
    getAutoSuggestUsers(loginSubstring, Number(limit))
      .then(({ statusCode, payload }) => {
        res.status(statusCode).json(payload)
      })
      .catch((error: unknown) => {
        next(createHttpError(500, 'Internal Server Error', isError(error) ? error : undefined))
      })
  } else {
    next(createHttpError(422, 'Incorrect request parameters'))
  }
})
