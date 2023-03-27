
import jwt from 'jsonwebtoken'

import { getAllUsers } from './users.service'

export const notSoSecretSecret = 'notSoSecretSecret'

export const login = async (loginConfig: unknown) => {
  if (typeof loginConfig !== 'object' || loginConfig === null || Array.isArray(loginConfig)) {
    throw new Error('[login]: login config should be not null, non array object')
  }

  const { login, password } = loginConfig as Record<string, unknown>

  if (login === undefined || password === undefined) {
    throw new Error('[login]: login or password is undefined')
  }

  if (typeof login !== 'string' || typeof password !== 'string') {
    throw new Error('[login]: login or password is not string')
  }

  const { payload: { users } } = await getAllUsers()
  const user = users.find(user => user.login === login && user.password === password && !user.isDeleted)

  if (user == null) {
    return { statusCode: 401, payload: { success: false, message: 'Bad login\\password combination' } }
  }

  const token = jwt.sign({ sub: user.id }, notSoSecretSecret, { expiresIn: 120 })

  return { statusCode: 200, payload: { success: true, token } }
}
