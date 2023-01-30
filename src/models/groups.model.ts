import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'

import { sequelizePostgresql } from '../loaders/database/database'

export enum GroupPermissions {
  read = 'READ',
  write = 'WRITE',
  delete = 'DELETE',
  share = 'SHARE',
  uploadFiles = 'UPLOAD_FILES',
}

interface GroupModel extends Model<InferAttributes<GroupModel>, InferCreationAttributes<GroupModel>> {
  id: CreationOptional<string>
  name: string
  permissions: GroupPermissions[]
}

export type NewGroupConfig = Pick<GroupModel, 'name' | 'permissions'>

export const Groups = sequelizePostgresql.define<GroupModel>('groups', {
  id: {
    type: DataTypes.UUID,
    autoIncrement: true,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  permissions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  }
}, {
  timestamps: false
})
