import { createUser } from '../user.model'

export const usersDataBase = [
  createUser({ login: 'login_1', password: 'password_1', age: 22, isDeleted: false }),
  createUser({ login: 'login_2', password: 'password_2', age: 23, isDeleted: true }),
  createUser({ login: 'login_3', password: 'password_3', age: 24, isDeleted: false })
]
