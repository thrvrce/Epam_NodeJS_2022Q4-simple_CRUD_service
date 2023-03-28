import { describe, expect, test, jest } from '@jest/globals'
import { validate } from 'uuid'

import { getAllUsers, getUserById, createNewUser, patchUserById, deleteUserById, getAutoSuggestUsers } from '../../services/users.service'
import { Users } from '../../models/users.model'
import { isValidCreateUserBody, isValidUpdateUserBody } from '../../utils/checkers'

jest.mock('../../utils/checkers', () => ({
  isValidCreateUserBody: {
    validate: jest.fn()
  },
  isValidUpdateUserBody: {
    validate: jest.fn()
  }
}))

jest.mock('../../models/users.model.ts', () => ({
  Users: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  }
}))

jest.mock('uuid', () => ({
  validate: jest.fn()
}))

describe('users.service', () => {
  describe('getAllUsers', () => {
    test('should return statusCode 200 and payload from Users.findAll()', async () => {
      (Users.findAll as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve([1, 2, 3])
      )
      const result = await getAllUsers()

      expect(result).toEqual({
        statusCode: 200,
        payload: { users: [1, 2, 3] }
      })
    })

    test('should throw error if Users.findAll() throws', async () => {
      (Users.findAll as jest.Mock).mockImplementationOnce(
        async () => await Promise.reject(new Error())
      )
      try {
        await getAllUsers()
      } catch (err: unknown) {
        expect(err instanceof Error).toBe(true)
        expect((err as Error).message).toBe(
          'Sequelize error during getAllUsers execution'
        )
      }
    })
  })

  describe('getUserById', () => {
    test('should return statusCode 400 and payload with message if given id is invalid', async () => {
      (validate as jest.Mock).mockImplementationOnce(() => false)
      const result = await getUserById('mockId')

      expect(result).toEqual({
        statusCode: 400,
        payload: { message: 'uuid is invalid' }
      })
    })

    test('should return statusCode 404 and payload with message if Users.findByPk(id) returns null', async () => {
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Users.findByPk as jest.Mock).mockImplementationOnce(async () => await Promise.resolve(null))
      const result = await getUserById('mockId')

      expect(Users.findByPk).toHaveBeenCalledWith('mockId')
      expect(result).toEqual({
        statusCode: 404,
        payload: { message: 'user with given uuid was not found' }
      })
    })

    test('should return statusCode 200 and payload with user if Users.findByPk(id) returns not null', async () => {
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Users.findByPk as jest.Mock).mockImplementationOnce(async () => await Promise.resolve({ id: 'mockId' }))
      const result = await getUserById('mockId')

      expect(Users.findByPk).toHaveBeenCalledWith('mockId')
      expect(result).toEqual({
        statusCode: 200,
        payload: { user: { id: 'mockId' } }
      })
    })

    test('should throw error if Users.findByPk(id) throws', async () => {
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Users.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.reject(new Error())
      )
      try {
        await getUserById('mockId')
      } catch (err: unknown) {
        expect(err instanceof Error).toBe(true)
        expect((err as Error).message).toBe(
          'Sequelize error during getUserById execution'
        )
      }
    })
  })

  describe('createNewUser', () => {
    test('should return statusCode 400 and error message if isValidCreateUserBody.validate returns not undefined error', async () => {
      (isValidCreateUserBody.validate as jest.Mock).mockImplementationOnce(() => ({ error: { message: 'mock error' } }))
      const mockNewUserConfig = {}
      const result = await createNewUser(mockNewUserConfig)

      expect(isValidCreateUserBody.validate).toHaveBeenCalledWith(mockNewUserConfig)
      expect(result).toEqual({ statusCode: 400, payload: { message: 'mock error' } })
    })

    test('should return statusCode 201 and payload with new user from Users.create if isValidCreateUserBody.validate returns undefined error', async () => {
      const mockValidatedNewUserConfig = { mockValidatedNewUserConfig: 'mockValidatedNewUserConfig' }
      const mockNewUser = { dataValues: { mockNewUser: 'mockNewUser' } };
      (isValidCreateUserBody.validate as jest.Mock).mockImplementationOnce(() => ({ error: undefined, value: mockValidatedNewUserConfig }));
      (Users.create as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve(mockNewUser)
      )
      const mockNewUserConfig = { mockNewUserConfig: 'mockNewUserConfig' }
      const result = await createNewUser(mockNewUserConfig)

      expect(isValidCreateUserBody.validate).toHaveBeenCalledWith(mockNewUserConfig)
      expect(Users.create).toHaveBeenCalledWith(mockValidatedNewUserConfig)
      expect(result).toEqual({ statusCode: 201, payload: { newUser: mockNewUser.dataValues } })
    })

    test('should return error if Users.create throws', async () => {
      const mockValidatedNewUserConfig = { mockValidatedNewUserConfig: 'mockValidatedNewUserConfig' };
      (isValidCreateUserBody.validate as jest.Mock).mockImplementationOnce(() => ({ error: undefined, value: mockValidatedNewUserConfig }));
      (Users.create as jest.Mock).mockImplementationOnce(
        async () => await Promise.reject(new Error())
      )
      const mockNewUserConfig = { mockNewUserConfig: 'mockNewUserConfig' }
      try {
        await createNewUser(mockNewUserConfig)
      } catch (err: unknown) {
        expect(isValidCreateUserBody.validate).toHaveBeenCalledWith(mockNewUserConfig)
        expect(Users.create).toHaveBeenCalledWith(mockValidatedNewUserConfig)
        expect(err instanceof Error).toBe(true)
        expect((err as Error).message).toBe(
          'Sequelize error during createNewUser execution'
        )
      }
    })
  })

  describe('patchUserById', () => {
    test('should return statusCode 400 and error message if isValidUpdateUserBody.validate returns not undefined error', async () => {
      (isValidUpdateUserBody.validate as jest.Mock).mockImplementationOnce(() => ({ error: { message: 'mock error' } }))
      const mockNewUserConfig = {}
      const result = await patchUserById('id', mockNewUserConfig)

      expect(isValidUpdateUserBody.validate).toHaveBeenCalledWith(mockNewUserConfig)
      expect(result).toEqual({ statusCode: 400, payload: { message: 'mock error' } })
    })

    test('should return statusCode 400 and error message if validate(id) returns false', async () => {
      (isValidUpdateUserBody.validate as jest.Mock).mockImplementationOnce(() => ({ }));
      (validate as jest.Mock).mockImplementationOnce(() => false)
      const mockNewUserConfig = {}
      const result = await patchUserById('id', mockNewUserConfig)

      expect(isValidUpdateUserBody.validate).toHaveBeenCalledWith(mockNewUserConfig)
      expect(validate).toHaveBeenCalledWith('id')
      expect(result).toEqual({ statusCode: 400, payload: { message: 'uuid is invalid' } })
    })

    test('should return statusCode 400 and error message if Users.findByPk returns null', async () => {
      (isValidUpdateUserBody.validate as jest.Mock).mockImplementationOnce(() => ({ }));
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Users.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve(null)
      )
      const mockNewUserConfig = {}
      const result = await patchUserById('id', mockNewUserConfig)

      expect(isValidUpdateUserBody.validate).toHaveBeenCalledWith(mockNewUserConfig)
      expect(validate).toHaveBeenCalledWith('id')
      expect(Users.findByPk).toHaveBeenCalledWith('id')
      expect(result).toEqual({ statusCode: 404, payload: { message: 'user with given uuid was not found' } })
    })

    test('should save user and return statusCode 200 and updatedUser if Users.findByPk does not return null', async () => {
      const mockUser = { save: jest.fn(), dataValues: {} };
      (isValidUpdateUserBody.validate as jest.Mock).mockImplementationOnce(() => ({ value: {} }));
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Users.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve(mockUser)
      )
      const mockNewUserConfig = {}
      const result = await patchUserById('id', mockNewUserConfig)

      expect(isValidUpdateUserBody.validate).toHaveBeenCalledWith(mockNewUserConfig)
      expect(validate).toHaveBeenCalledWith('id')
      expect(Users.findByPk).toHaveBeenCalledWith('id')
      expect(mockUser.save).toHaveBeenCalled()
      expect(result).toEqual({ statusCode: 200, payload: { updatedUser: mockUser.dataValues } })
    })

    test('should return error if  Users.findByPk throws', async () => {
      const mockUser = { save: jest.fn(), dataValues: {} };
      (isValidUpdateUserBody.validate as jest.Mock).mockImplementationOnce(() => ({ value: {} }));
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Users.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.reject(new Error())
      )
      const mockNewUserConfig = {}
      try {
        await patchUserById('id', mockNewUserConfig)
      } catch (err: unknown) {
        expect(isValidUpdateUserBody.validate).toHaveBeenCalledWith(mockNewUserConfig)
        expect(validate).toHaveBeenCalledWith('id')
        expect(Users.findByPk).toHaveBeenCalledWith('id')
        expect(mockUser.save).not.toHaveBeenCalled()
        expect(err instanceof Error).toBe(true)
        expect((err as Error).message).toBe(
          'Sequelize error during patchUserById execution'
        )
      }
    })

    test('should return error if user.save throws', async () => {
      const mockUser = { save: jest.fn(async () => await Promise.reject(new Error())), dataValues: {} };
      (isValidUpdateUserBody.validate as jest.Mock).mockImplementationOnce(() => ({ value: {} }));
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Users.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve(mockUser)
      )
      const mockNewUserConfig = {}
      try {
        await patchUserById('id', mockNewUserConfig)
      } catch (err: unknown) {
        expect(isValidUpdateUserBody.validate).toHaveBeenCalledWith(mockNewUserConfig)
        expect(validate).toHaveBeenCalledWith('id')
        expect(Users.findByPk).toHaveBeenCalledWith('id')
        expect(mockUser.save).toHaveBeenCalled()
        expect(err instanceof Error).toBe(true)
        expect((err as Error).message).toBe(
          'Sequelize error during patchUserById execution'
        )
      }
    })
  })

  describe('deleteUserById', () => {
    test('should return statusCode 400 and error message if validate(id) returns false', async () => {
      (validate as jest.Mock).mockImplementationOnce(() => false)
      const result = await deleteUserById('id')

      expect(validate).toHaveBeenCalledWith('id')
      expect(result).toEqual({ statusCode: 400, payload: { message: 'uuid is invalid' } })
    })

    test('should return statusCode 400 and error message if Users.findByPk returns null', async () => {
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Users.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve(null)
      )
      const result = await deleteUserById('id')

      expect(validate).toHaveBeenCalledWith('id')
      expect(Users.findByPk).toHaveBeenCalledWith('id')
      expect(result).toEqual({ statusCode: 404, payload: { message: 'user with given uuid was not found' } })
    })

    test('should save user changes and return statusCode 204 and message if user was marked as deleted', async () => {
      const mockUser = { isDeleted: false, save: jest.fn() };
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Users.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve(mockUser)
      )
      const result = await deleteUserById('id')

      expect(validate).toHaveBeenCalledWith('id')
      expect(Users.findByPk).toHaveBeenCalledWith('id')
      expect(mockUser.save).toHaveBeenCalled()
      expect(result).toEqual({ statusCode: 204, payload: { message: 'User with id id was marked as deleted' } })
    })

    test('should not save user changes and return statusCode 204 and message if user is already marked as deleted', async () => {
      const mockUser = { isDeleted: true, save: jest.fn() };
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Users.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve(mockUser)
      )
      const result = await deleteUserById('id')

      expect(validate).toHaveBeenCalledWith('id')
      expect(Users.findByPk).toHaveBeenCalledWith('id')
      expect(mockUser.save).not.toHaveBeenCalled()
      expect(result).toEqual({ statusCode: 204, payload: { message: 'User with id id already was marked as deleted' } })
    })
    test('should return error if  Users.findByPk throws', async () => {
      const mockUser = { save: jest.fn() };
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Users.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.reject(new Error())
      )

      try {
        await deleteUserById('id')
      } catch (err: unknown) {
        expect(validate).toHaveBeenCalledWith('id')
        expect(Users.findByPk).toHaveBeenCalledWith('id')
        expect(mockUser.save).not.toHaveBeenCalled()
        expect(err instanceof Error).toBe(true)
        expect((err as Error).message).toBe(
          'Sequelize error during deleteUserById execution'
        )
      }
    })

    test('should return error if user.save throws', async () => {
      const mockUser = { save: jest.fn(async () => await Promise.reject(new Error())) };
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Users.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve(mockUser)
      )
      try {
        await deleteUserById('id')
      } catch (err: unknown) {
        expect(validate).toHaveBeenCalledWith('id')
        expect(Users.findByPk).toHaveBeenCalledWith('id')
        expect(mockUser.save).toHaveBeenCalled()
        expect(err instanceof Error).toBe(true)
        expect((err as Error).message).toBe(
          'Sequelize error during deleteUserById execution'
        )
      }
    })
  })

  describe('getAutoSuggestUsers', () => {
    test('should return sorted list of users with given substring in login', async () => {
      const mockUsers = [{ login: 'bc' }, { login: 'abc' }, { login: 'a' }, { login: 'ab' }];
      (Users.findAll as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve(mockUsers)
      )

      const result = await getAutoSuggestUsers('b', 10)

      expect(result).toEqual({ statusCode: 200, payload: { sortedFilteredUsers: [{ login: 'bc' }, { login: 'abc' }, { login: 'ab' }] } })
    })
  })
})
