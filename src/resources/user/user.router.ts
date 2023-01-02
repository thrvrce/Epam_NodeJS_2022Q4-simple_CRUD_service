import { Router } from 'express'
import {
  createNewUser,
  deleteUserById,
  getAllUsers, getAutoSuggestUsers, getUserById, patchUserById

} from './user.service'
import createHttpError from '../../utils/createHttpError'
import { isNotNullish } from '../../utils/checkers'

export const userRouter = Router()

userRouter.get('/', (req, res, next) => {
  try {
    const { statusCode, payload } = getAllUsers()
    res.status(statusCode)
    res.json(payload)
  } catch (err) {
    next(createHttpError(500, 'Internal Server Error'))
  }
})

userRouter.get('/user/:userId', (req, res, next) => {
  try {
    const { statusCode, payload } = getUserById(req.params.userId)
    res.status(statusCode)
    res.json(payload)
  } catch (err) {
    next(createHttpError(500, 'Internal Server Error'))
  }
})

userRouter.post('/user', (req, res, next) => {
  try {
    const { statusCode, payload } = createNewUser(req.body)
    res.status(statusCode)
    res.json(payload)
  } catch (err) {
    next(createHttpError(500, 'Internal Server Error'))
  }
})

userRouter.put('/user/:userId', (req, res, next) => {
  try {
    const { statusCode, payload } = patchUserById(req.params.userId, req.body)
    res.status(statusCode)
    res.json(payload)
  } catch (err) {
    next(createHttpError(500, 'Internal Server Error'))
  }
})

userRouter.delete('/user/:userId', (req, res, next) => {
  try {
    const { statusCode, payload } = deleteUserById(req.params.userId)
    res.status(statusCode)
    res.json(payload)
  } catch (err) {
    next(createHttpError(500, 'Internal Server Error'))
  }
})

userRouter.get('/AutoSuggestUsers', (req, res, next) => {
  const { query: { limit, loginSubstring } } = req

  if (isNotNullish(limit) && typeof limit === 'string' && isNotNullish(loginSubstring) && typeof loginSubstring === 'string') {
    try {
      const { statusCode, payload } = getAutoSuggestUsers(loginSubstring, Number(limit))
      res.status(statusCode)
      res.json(payload)
    } catch (err) {
      next(createHttpError(500, 'Internal Server Error'))
    }
  } else {
    next(createHttpError(422, 'Incorrect request parameters'))
  }
})
