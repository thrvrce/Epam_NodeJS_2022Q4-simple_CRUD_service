import { validate } from 'uuid'

import { isValidUpdateGroupBody, isValidCreateGroupBody } from '../utils/checkers'
import { Groups } from '../models/groups.model'

export const getAllGroups = async () => {
  try {
    const groups = await Groups.findAll()

    return { statusCode: 200, payload: { groups } }
  } catch (error) {
    throw new Error('Sequelize error during getAllGroups execution')
  }
}

export const getGroupById = async (id: string) => {
  if (!validate(id)) {
    return { statusCode: 400, payload: { message: 'uuid is invalid' } }
  }

  try {
    const group = await Groups.findByPk(id)

    if (group === null) {
      return { statusCode: 404, payload: { message: 'group with given uuid was not found' } }
    }

    return { statusCode: 200, payload: { group } }
  } catch (error) {
    throw new Error('Sequelize error during getGroupById execution')
  }
}

export const createNewGroup = async (newGroupConfig: unknown) => {
  const { value, error } = isValidCreateGroupBody.validate(newGroupConfig)

  if (error !== undefined) {
    return { statusCode: 400, payload: { message: error.message } }
  }

  try {
    const newGroup = await Groups.create(value)
    return { statusCode: 201, payload: { newGroup: newGroup.dataValues } }
  } catch (error) {
    throw new Error('Sequelize error during createNewGroup execution')
  }
}

export const patchGroupById = async (id: string, newGroupConfig: unknown) => {
  const { value, error } = isValidUpdateGroupBody.validate(newGroupConfig)

  if (error !== undefined) {
    return { statusCode: 400, payload: { message: error.message } }
  }

  if (!validate(id)) {
    return { statusCode: 400, payload: { message: 'uuid is invalid' } }
  }

  try {
    const group = await Groups.findByPk(id)

    if (group === null) {
      return { statusCode: 404, payload: { message: 'group with given uuid was not found' } }
    }

    group.name = value.name
    group.permissions = value.permissions

    await group.save()

    return { statusCode: 200, payload: { updatedGroup: group.dataValues } }
  } catch (error) {
    throw new Error('Sequelize error during patchGroupById execution')
  }
}

export const deleteGroupById = async (id: string) => {
  if (!validate(id)) {
    return { statusCode: 400, payload: { message: 'uuid is invalid' } }
  }

  try {
    const group = await Groups.findByPk(id)

    if (group === null) {
      return { statusCode: 404, payload: { message: 'group with given uuid was not found' } }
    }

    await group.destroy()

    return { statusCode: 204, payload: { message: `group with id ${id} was deleted` } }
  } catch (error) {
    throw new Error('Sequelize error during deleteGroupById execution')
  }
}
