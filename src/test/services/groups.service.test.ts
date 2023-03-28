import { describe, expect, test, jest } from '@jest/globals'
import { validate } from 'uuid'

import {
  getAllGroups,
  getGroupById,
  createNewGroup,
  patchGroupById,
  deleteGroupById
} from '../../services/groups.service'
import { Groups } from '../../models/groups.model'
import { isValidCreateGroupBody, isValidUpdateGroupBody } from '../../utils/checkers'

jest.mock('../../utils/checkers', () => ({
  isValidCreateGroupBody: {
    validate: jest.fn()
  },
  isValidUpdateGroupBody: {
    validate: jest.fn()
  }
}))

jest.mock('../../models/groups.model.ts', () => ({
  Groups: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  }
}))

jest.mock('uuid', () => ({
  validate: jest.fn()
}))

describe('groups.service', () => {
  describe('getAllGroups', () => {
    test('should return statusCode 200 and payload from Groups.findAll()', async () => {
      (Groups.findAll as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve([1, 2, 3])
      )
      const result = await getAllGroups()

      expect(result).toEqual({
        statusCode: 200,
        payload: { groups: [1, 2, 3] }
      })
    })

    test('should throw error if Groups.findAll() throws', async () => {
      (Groups.findAll as jest.Mock).mockImplementationOnce(
        async () => await Promise.reject(new Error())
      )
      try {
        await getAllGroups()
      } catch (err: unknown) {
        expect(err instanceof Error).toBe(true)
        expect((err as Error).message).toBe(
          'Sequelize error during getAllGroups execution'
        )
      }
    })
  })

  describe('getGroupById', () => {
    test('should return statusCode 400 and payload with message if given id is invalid', async () => {
      (validate as jest.Mock).mockImplementationOnce(() => false)
      const result = await getGroupById('mockId')

      expect(result).toEqual({
        statusCode: 400,
        payload: { message: 'uuid is invalid' }
      })
    })

    test('should return statusCode 404 and payload with message if Groups.findByPk(id) returns null', async () => {
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Groups.findByPk as jest.Mock).mockImplementationOnce(async () => await Promise.resolve(null))
      const result = await getGroupById('mockId')

      expect(Groups.findByPk).toHaveBeenCalledWith('mockId')
      expect(result).toEqual({
        statusCode: 404,
        payload: { message: 'group with given uuid was not found' }
      })
    })

    test('should return statusCode 200 and payload with group if Groups.findByPk(id) returns not null', async () => {
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Groups.findByPk as jest.Mock).mockImplementationOnce(async () => await Promise.resolve({ id: 'mockId' }))
      const result = await getGroupById('mockId')

      expect(Groups.findByPk).toHaveBeenCalledWith('mockId')
      expect(result).toEqual({
        statusCode: 200,
        payload: { group: { id: 'mockId' } }
      })
    })

    test('should throw error if Groups.findByPk(id) throws', async () => {
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Groups.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.reject(new Error())
      )
      try {
        await getGroupById('mockId')
      } catch (err: unknown) {
        expect(err instanceof Error).toBe(true)
        expect((err as Error).message).toBe(
          'Sequelize error during getGroupById execution'
        )
      }
    })
  })

  describe('createNewGroup', () => {
    test('should return statusCode 400 and error message if isValidCreateGroupBody.validate returns not undefined error', async () => {
      (isValidCreateGroupBody.validate as jest.Mock).mockImplementationOnce(() => ({ error: { message: 'mock error' } }))
      const mockNewGroupConfig = {}
      const result = await createNewGroup(mockNewGroupConfig)

      expect(isValidCreateGroupBody.validate).toHaveBeenCalledWith(mockNewGroupConfig)
      expect(result).toEqual({ statusCode: 400, payload: { message: 'mock error' } })
    })

    test('should return statusCode 201 and payload with new group from Groups.create if isValidCreateGroupBody.validate returns undefined error', async () => {
      const mockValidatedNewGroupConfig = { mockValidatedNewGroupConfig: 'mockValidatedNewGroupConfig' }
      const mockNewGroup = { dataValues: { mockNewGroup: 'mockNewGroup' } };
      (isValidCreateGroupBody.validate as jest.Mock).mockImplementationOnce(() => ({ error: undefined, value: mockValidatedNewGroupConfig }));
      (Groups.create as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve(mockNewGroup)
      )
      const mockNewGroupConfig = { mockNewGroupConfig: 'mockNewGroupConfig' }
      const result = await createNewGroup(mockNewGroupConfig)

      expect(isValidCreateGroupBody.validate).toHaveBeenCalledWith(mockNewGroupConfig)
      expect(Groups.create).toHaveBeenCalledWith(mockValidatedNewGroupConfig)
      expect(result).toEqual({ statusCode: 201, payload: { newGroup: mockNewGroup.dataValues } })
    })

    test('should return error if Groups.create throws', async () => {
      const mockValidatedNewGroupConfig = { mockValidatedNewGroupConfig: 'mockValidatedNewGroupConfig' };
      (isValidCreateGroupBody.validate as jest.Mock).mockImplementationOnce(() => ({ error: undefined, value: mockValidatedNewGroupConfig }));
      (Groups.create as jest.Mock).mockImplementationOnce(
        async () => await Promise.reject(new Error())
      )
      const mockNewGroupConfig = { mockNewGroupConfig: 'mockNewGroupConfig' }
      try {
        await createNewGroup(mockNewGroupConfig)
      } catch (err: unknown) {
        expect(isValidCreateGroupBody.validate).toHaveBeenCalledWith(mockNewGroupConfig)
        expect(Groups.create).toHaveBeenCalledWith(mockValidatedNewGroupConfig)
        expect(err instanceof Error).toBe(true)
        expect((err as Error).message).toBe(
          'Sequelize error during createNewGroup execution'
        )
      }
    })
  })

  describe('patchGroupById', () => {
    test('should return statusCode 400 and error message if isValidUpdateGroupBody.validate returns not undefined error', async () => {
      (isValidUpdateGroupBody.validate as jest.Mock).mockImplementationOnce(() => ({ error: { message: 'mock error' } }))
      const mockNewGroupConfig = {}
      const result = await patchGroupById('id', mockNewGroupConfig)

      expect(isValidUpdateGroupBody.validate).toHaveBeenCalledWith(mockNewGroupConfig)
      expect(result).toEqual({ statusCode: 400, payload: { message: 'mock error' } })
    })

    test('should return statusCode 400 and error message if validate(id) returns false', async () => {
      (isValidUpdateGroupBody.validate as jest.Mock).mockImplementationOnce(() => ({ }));
      (validate as jest.Mock).mockImplementationOnce(() => false)
      const mockNewGroupConfig = {}
      const result = await patchGroupById('id', mockNewGroupConfig)

      expect(isValidUpdateGroupBody.validate).toHaveBeenCalledWith(mockNewGroupConfig)
      expect(validate).toHaveBeenCalledWith('id')
      expect(result).toEqual({ statusCode: 400, payload: { message: 'uuid is invalid' } })
    })

    test('should return statusCode 400 and error message if Groups.findByPk returns null', async () => {
      (isValidUpdateGroupBody.validate as jest.Mock).mockImplementationOnce(() => ({ }));
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Groups.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve(null)
      )
      const mockNewGroupConfig = {}
      const result = await patchGroupById('id', mockNewGroupConfig)

      expect(isValidUpdateGroupBody.validate).toHaveBeenCalledWith(mockNewGroupConfig)
      expect(validate).toHaveBeenCalledWith('id')
      expect(Groups.findByPk).toHaveBeenCalledWith('id')
      expect(result).toEqual({ statusCode: 404, payload: { message: 'group with given uuid was not found' } })
    })

    test('should save group and return statusCode 200 and updatedGroup if Groups.findByPk does not return null', async () => {
      const mockGroup = { save: jest.fn(), dataValues: {} };
      (isValidUpdateGroupBody.validate as jest.Mock).mockImplementationOnce(() => ({ value: {} }));
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Groups.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve(mockGroup)
      )
      const mockNewGroupConfig = {}
      const result = await patchGroupById('id', mockNewGroupConfig)

      expect(isValidUpdateGroupBody.validate).toHaveBeenCalledWith(mockNewGroupConfig)
      expect(validate).toHaveBeenCalledWith('id')
      expect(Groups.findByPk).toHaveBeenCalledWith('id')
      expect(mockGroup.save).toHaveBeenCalled()
      expect(result).toEqual({ statusCode: 200, payload: { updatedGroup: mockGroup.dataValues } })
    })

    test('should return error if  Groups.findByPk throws', async () => {
      const mockGroup = { save: jest.fn(), dataValues: {} };
      (isValidUpdateGroupBody.validate as jest.Mock).mockImplementationOnce(() => ({ value: {} }));
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Groups.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.reject(new Error())
      )
      const mockNewGroupConfig = {}
      try {
        await patchGroupById('id', mockNewGroupConfig)
      } catch (err: unknown) {
        expect(isValidUpdateGroupBody.validate).toHaveBeenCalledWith(mockNewGroupConfig)
        expect(validate).toHaveBeenCalledWith('id')
        expect(Groups.findByPk).toHaveBeenCalledWith('id')
        expect(mockGroup.save).not.toHaveBeenCalled()
        expect(err instanceof Error).toBe(true)
        expect((err as Error).message).toBe(
          'Sequelize error during patchGroupById execution'
        )
      }
    })

    test('should return error if group.save throws', async () => {
      const mockGroup = { save: jest.fn(async () => await Promise.reject(new Error())), dataValues: {} };
      (isValidUpdateGroupBody.validate as jest.Mock).mockImplementationOnce(() => ({ value: {} }));
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Groups.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve(mockGroup)
      )
      const mockNewGroupConfig = {}
      try {
        await patchGroupById('id', mockNewGroupConfig)
      } catch (err: unknown) {
        expect(isValidUpdateGroupBody.validate).toHaveBeenCalledWith(mockNewGroupConfig)
        expect(validate).toHaveBeenCalledWith('id')
        expect(Groups.findByPk).toHaveBeenCalledWith('id')
        expect(mockGroup.save).toHaveBeenCalled()
        expect(err instanceof Error).toBe(true)
        expect((err as Error).message).toBe(
          'Sequelize error during patchGroupById execution'
        )
      }
    })
  })

  describe('deleteGroupById', () => {
    test('should return statusCode 400 and error message if validate(id) returns false', async () => {
      (validate as jest.Mock).mockImplementationOnce(() => false)
      const result = await deleteGroupById('id')

      expect(validate).toHaveBeenCalledWith('id')
      expect(result).toEqual({ statusCode: 400, payload: { message: 'uuid is invalid' } })
    })

    test('should return statusCode 400 and error message if Groups.findByPk returns null', async () => {
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Groups.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve(null)
      )
      const result = await deleteGroupById('id')

      expect(validate).toHaveBeenCalledWith('id')
      expect(Groups.findByPk).toHaveBeenCalledWith('id')
      expect(result).toEqual({ statusCode: 404, payload: { message: 'group with given uuid was not found' } })
    })

    test('should destroy group and return statusCode 204 and message if group was deleted', async () => {
      const mockGroup = { destroy: jest.fn() };
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Groups.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve(mockGroup)
      )
      const result = await deleteGroupById('id')

      expect(validate).toHaveBeenCalledWith('id')
      expect(Groups.findByPk).toHaveBeenCalledWith('id')
      expect(mockGroup.destroy).toHaveBeenCalled()
      expect(result).toEqual({ statusCode: 204, payload: { message: 'group with id id was deleted' } })
    })

    test('should return error if  Groups.findByPk throws', async () => {
      const mockGroup = { save: jest.fn() };
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Groups.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.reject(new Error())
      )

      try {
        await deleteGroupById('id')
      } catch (err: unknown) {
        expect(validate).toHaveBeenCalledWith('id')
        expect(Groups.findByPk).toHaveBeenCalledWith('id')
        expect(mockGroup.save).not.toHaveBeenCalled()
        expect(err instanceof Error).toBe(true)
        expect((err as Error).message).toBe(
          'Sequelize error during deleteGroupById execution'
        )
      }
    })

    test('should return error if group.destroy throws', async () => {
      const mockGroup = { destroy: jest.fn(async () => await Promise.reject(new Error())) };
      (validate as jest.Mock).mockImplementationOnce(() => true);
      (Groups.findByPk as jest.Mock).mockImplementationOnce(
        async () => await Promise.resolve(mockGroup)
      )
      try {
        await deleteGroupById('id')
      } catch (err: unknown) {
        expect(validate).toHaveBeenCalledWith('id')
        expect(Groups.findByPk).toHaveBeenCalledWith('id')
        expect(mockGroup.destroy).toHaveBeenCalled()
        expect(err instanceof Error).toBe(true)
        expect((err as Error).message).toBe(
          'Sequelize error during deleteGroupById execution'
        )
      }
    })
  })
})
