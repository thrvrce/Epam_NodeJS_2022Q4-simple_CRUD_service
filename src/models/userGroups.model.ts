import { Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize'

import { sequelizePostgresql } from '../loaders/database/database'
import { Groups } from './groups.model'
import { Users } from './users.model'

interface UserGroupsModel extends Model<InferAttributes<UserGroupsModel>, InferCreationAttributes<UserGroupsModel>> {
  userId: string
  groupId: string
}

export type NewUserGroup = Pick<UserGroupsModel, 'userId' | 'groupId'>

export const UserGroups = sequelizePostgresql.define<UserGroupsModel>('userGroups', {
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Users,
      key: 'id'
    }
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Groups,
      key: 'id'
    }
  }
}, {
  timestamps: false
})
