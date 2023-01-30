import { Router } from 'express'

import {
  createNewGroup, deleteGroupById, getAllGroups, getGroupById, patchGroupById
} from '../../services/groups.service'
import createHttpError from '../../utils/createHttpError'
import { isError } from '../../utils/checkers'

export const groupsRouter = Router()

groupsRouter.get('/', (req, res, next) => {
  getAllGroups()
    .then(({ statusCode, payload }) => {
      res.status(statusCode).json(payload)
    })
    .catch((error: unknown) => {
      next(createHttpError(500, 'Internal Server Error', isError(error) ? error : undefined))
    })
})

groupsRouter.get('/group/:groupId', (req, res, next) => {
  getGroupById(req.params.groupId)
    .then(({ statusCode, payload }) => {
      res.status(statusCode).json(payload)
    })
    .catch((error: unknown) => {
      next(createHttpError(500, 'Internal Server Error', isError(error) ? error : undefined))
    })
})

groupsRouter.post('/group', (req, res, next) => {
  createNewGroup(req.body)
    .then(({ statusCode, payload }) => {
      res.status(statusCode).json(payload)
    })
    .catch((error: unknown) => {
      next(createHttpError(500, 'Internal Server Error', isError(error) ? error : undefined))
    })
})

groupsRouter.put('/group/:groupId', (req, res, next) => {
  patchGroupById(req.params.groupId, req.body)
    .then(({ statusCode, payload }) => {
      res.status(statusCode).json(payload)
    })
    .catch((error: unknown) => {
      next(createHttpError(500, 'Internal Server Error', isError(error) ? error : undefined))
    })
})

groupsRouter.delete('/group/:groupId', (req, res, next) => {
  deleteGroupById(req.params.groupId)
    .then(({ statusCode, payload }) => {
      res.status(statusCode).json(payload)
    })
    .catch((error: unknown) => {
      next(createHttpError(500, 'Internal Server Error', isError(error) ? error : undefined))
    })
})
