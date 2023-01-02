import { v4 as uuidV4 } from 'uuid'

export interface User {
  id: string
  login: string
  password: string
  age: number
  isDeleted: boolean
}

export type NewUserConfig = Omit<User, 'id'>

export const createUser = (newUserConfig: NewUserConfig): User => {
  const { login, password, age, isDeleted } = newUserConfig

  return {
    id: uuidV4(),
    login,
    password,
    age,
    isDeleted
  }
}
