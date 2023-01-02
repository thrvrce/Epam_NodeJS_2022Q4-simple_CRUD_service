import { isValidCreateBody, isValidUpdateBody } from '../../utils/checkers'
import { validate } from 'uuid'
import { usersDatabaseApi } from './database/user.databaseAPI'
import { NewUserConfig, createUser } from './user.model'

export const getAllUsers = () => (
  { statusCode: 200, payload: { users: usersDatabaseApi.getAllUsers() } })

export const getUserById = (id: string) => {
  if (!validate(id)) {
    return { statusCode: 400, payload: { message: 'uuid is invalid' } }
  }
  const user = usersDatabaseApi.getUserById(id)

  if (user == null) {
    return { statusCode: 404, payload: { message: 'user with given uuid was not found' } }
  }

  return { statusCode: 200, payload: { user } }
}

export const createNewUser = (newUserConfig: unknown) => { // todo validate unknown payload
  const { value, error } = isValidCreateBody.validate(newUserConfig)
  if (error !== undefined) {
    return { statusCode: 400, payload: { message: error.message } }
  }

  const newUser = createUser(value)
  usersDatabaseApi.insertNewUser(newUser)
  return { statusCode: 201, payload: { newUser } }
}

export const patchUserById = (id: string, newUserConfig: NewUserConfig) => { // todo validate unknown payload
  const { value, error } = isValidUpdateBody.validate(newUserConfig)

  if (error !== undefined) {
    return { statusCode: 400, payload: { message: error.message } }
  }

  if (!validate(id)) {
    return { statusCode: 400, payload: { message: 'uuid is invalid' } }
  }

  const user = usersDatabaseApi.getUserById(id)

  if (user === undefined) {
    return { statusCode: 404, payload: { message: 'user with given uuid was not found' } }
  }

  const updatedUser = { ...user, ...value }

  usersDatabaseApi.patchUserById(id, updatedUser)

  return { statusCode: 200, payload: { updatedUser } }
}

export const deleteUserById = (id: string) => {
  if (!validate(id)) {
    return { statusCode: 400, payload: { message: 'uuid is invalid' } }
  }

  const user = usersDatabaseApi.getUserById(id)

  if (user === undefined) {
    return { statusCode: 404, payload: { message: 'user with given uuid was not found' } }
  }

  const result = usersDatabaseApi.deleteUserById(id)

  if (!result) {
    return { statusCode: 404, payload: { message: 'user with given uuid was not found' } }
  }

  return { statusCode: 204, payload: { message: `User with id ${id} was marked as deleted` } }
}

export const getAutoSuggestUsers = (loginSubstring: string, limit: number) => {
  const users = usersDatabaseApi.getAllUsers().slice(0, limit)
  const usersFilteredByLoginSubstring = users.filter(user => user.login.includes(loginSubstring))
  const sortedFilteredUsers = usersFilteredByLoginSubstring.sort((a, b) => a >= b ? 1 : -1)

  return { statusCode: 200, payload: { sortedFilteredUsers } }
}
