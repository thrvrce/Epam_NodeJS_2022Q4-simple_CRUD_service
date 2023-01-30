import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'

import { sequelizePostgresql } from '../loaders/database/database'

interface UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  id: CreationOptional<string>
  login: string
  password: string
  age: number
  isDeleted: boolean
}

export type NewUserConfig = Pick<UserModel, 'login' | 'password' | 'age' | 'isDeleted'>

export const Users = sequelizePostgresql.define<UserModel>('users', {
  id: {
    type: DataTypes.UUID,
    autoIncrement: true,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  login: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  age: {
    type: DataTypes.SMALLINT,
    allowNull: false
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  timestamps: false
})
