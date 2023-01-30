import { validate } from 'uuid'

import { isValidCreateUserBody, isValidUpdateUserBody } from '../utils/checkers'
import { Users } from '../models/users.model'

export const getAllUsers = async () => {
  try {
    const users = await Users.findAll()

    return { statusCode: 200, payload: { users } }
  } catch (error) {
    throw new Error('Sequelize error during getAllUsers execution')
  }
}

export const getUserById = async (id: string) => {
  if (!validate(id)) {
    return { statusCode: 400, payload: { message: 'uuid is invalid' } }
  }

  try {
    const user = await Users.findByPk(id)

    if (user === null) {
      return { statusCode: 404, payload: { message: 'user with given uuid was not found' } }
    }

    return { statusCode: 200, payload: { user } }
  } catch (error) {
    throw new Error('Sequelize error during getUserById execution')
  }
}

export const createNewUser = async (newUserConfig: unknown) => {
  const { value, error } = isValidCreateUserBody.validate(newUserConfig)

  if (error !== undefined) {
    return { statusCode: 400, payload: { message: error.message } }
  }

  try {
    const newUser = await Users.create(value)
    return { statusCode: 201, payload: { newUser: newUser.dataValues } }
  } catch (error) {
    throw new Error('Sequelize error during createNewUser execution')
  }
}

export const patchUserById = async (id: string, newUserConfig: unknown) => {
  const { value, error } = isValidUpdateUserBody.validate(newUserConfig)

  if (error !== undefined) {
    return { statusCode: 400, payload: { message: error.message } }
  }

  if (!validate(id)) {
    return { statusCode: 400, payload: { message: 'uuid is invalid' } }
  }

  try {
    const user = await Users.findByPk(id)

    if (user === null) {
      return { statusCode: 404, payload: { message: 'user with given uuid was not found' } }
    }

    user.login = value.login
    user.password = value.password
    user.age = value.age
    user.isDeleted = value.isDeleted

    await user.save()

    return { statusCode: 200, payload: { updatedUser: user.dataValues } }
  } catch (error) {
    throw new Error('Sequelize error during patchUserById execution')
  }
}

export const deleteUserById = async (id: string) => {
  if (!validate(id)) {
    return { statusCode: 400, payload: { message: 'uuid is invalid' } }
  }

  try {
    const user = await Users.findByPk(id)

    if (user === null) {
      return { statusCode: 404, payload: { message: 'user with given uuid was not found' } }
    }

    if (!user.isDeleted) {
      user.isDeleted = true
      await user.save()
      return { statusCode: 204, payload: { message: `User with id ${id} was marked as deleted` } }
    }

    return { statusCode: 204, payload: { message: `User with id ${id} already was marked as deleted` } }
  } catch (error) {
    throw new Error('Sequelize error during deleteUserById execution')
  }
}

export const getAutoSuggestUsers = async (loginSubstring: string, limit: number) => {
  try {
    const users = await Users.findAll()
    const usersFilteredByLoginSubstring = users.filter(user => user.login.includes(loginSubstring))
    const sortedFilteredUsers = usersFilteredByLoginSubstring.sort((a, b) => a >= b ? 1 : -1)

    return { statusCode: 200, payload: { sortedFilteredUsers } }
  } catch (error) {
    throw new Error('Sequelize error during getAutoSuggestUsers execution')
  }
}
