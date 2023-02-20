import { Router } from 'express'

import {
  getAllUserGroups, addUsersToGroup
} from '../../services/userGroups.service'
import createHttpError from '../../utils/createHttpError'
import { isError } from '../../utils/checkers'
import { logControllerInfo, logControllerError, userGroupsControllerLogger } from '../../utils/logger'

export const userGroupsRouter = Router()

userGroupsRouter.use(logControllerInfo(userGroupsControllerLogger))

userGroupsRouter.get('/', (req, res, next) => {
  getAllUserGroups()
    .then(({ statusCode, payload }) => {
      res.status(statusCode).json(payload)
    })
    .catch((error: unknown) => {
      next(createHttpError(500, 'Internal Server Error', isError(error) ? error : undefined))
    })
})

userGroupsRouter.post('/group/:groupId', (req, res, next) => {
  addUsersToGroup(req.params.groupId, req.body)
    .then(({ statusCode, payload }) => {
      res.status(statusCode).json(payload)
    })
    .catch((error: unknown) => {
      next(createHttpError(500, 'Internal Server Error', isError(error) ? error : undefined))
    })
})

userGroupsRouter.use(logControllerError(userGroupsControllerLogger))
