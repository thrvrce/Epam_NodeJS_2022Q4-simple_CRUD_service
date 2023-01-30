import { Op } from 'sequelize'
import { validate } from 'uuid'

import { Users } from '../models/users.model'
import { Groups } from '../models/groups.model'
import { UserGroups } from '../models/userGroups.model'
import { sequelizePostgresql } from '../loaders/database/database'

export const getAllUserGroups = async () => {
  try {
    const groups = await UserGroups.findAll()

    return { statusCode: 200, payload: { groups } }
  } catch (error) {
    throw new Error('Sequelize error during getAllUserGroups execution')
  }
}

export const addUsersToGroup = async (groupId: string, { userIds }: { userIds: string[] }) => {
  if (!validate(groupId)) {
    return { statusCode: 400, payload: { message: 'groupId is invalid' } }
  }

  if (!userIds.every(userId => validate(userId))) {
    return { statusCode: 400, payload: { message: 'some userIds is invalid' } }
  }
  try {
    const group = await Groups.findByPk(groupId)

    if (group === null) {
      return { statusCode: 404, payload: { message: 'group with given uuid was not found' } }
    }

    const users = await Users.findAll({
      attributes: ['id'],
      where: {
        id: {
          [Op.in]: userIds
        }
      }
    })

    if (users.length !== userIds.length) {
      return { statusCode: 404, payload: { message: 'some users with given uuid were not found' } }
    }

    const newUserGroupsRecords = await sequelizePostgresql.transaction(async (transaction) => {
      const _newUserGroupsRecords = await Promise.all(
        userIds.map(async userId => await UserGroups.create({ userId, groupId })))

      return _newUserGroupsRecords
    })

    return { statusCode: 200, payload: { newUserGroupsRecords } }
  } catch (error) {
    throw new Error('Sequelize error during addUsersToGroup execution')
  }
}
