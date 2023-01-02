import { usersDataBase } from './user.database'
import { User } from '../user.model'

const getAllUsers = (): User[] => usersDataBase

const getUserById = (id: string): User | undefined => usersDataBase.find(user => user.id === id)

const insertNewUser = (newUser: User): void => {
  usersDataBase.push(newUser)
}

const patchUserById = (id: string, updatedUser: User): void => {
  const usersIndex = usersDataBase.findIndex((User) => User.id === id)
  usersDataBase[usersIndex] = updatedUser
  // todo what if user was not found
}

const deleteUserById = (id: string): boolean => {
  const user = usersDataBase.find((User) => User.id === id)
  if (user !== undefined) {
    user.isDeleted = true
    return true
  }

  return false
}

export const usersDatabaseApi = {
  getAllUsers,
  getUserById,
  insertNewUser,
  patchUserById,
  deleteUserById
}
