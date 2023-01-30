import express, { NextFunction, Response, Request } from 'express'

import { usersRouter } from './routers/controllers/users.router'
import { groupsRouter } from './routers/controllers/groups.router'
import createHttpError, { isErrorWithStatus } from './utils/createHttpError'
import { connectToSequelizePostgresql } from './loaders/database/database'
import { Users } from './models/users.model'
import { Groups } from './models/groups.model'
import { UserGroups } from './models/userGroups.model'

const PORT = 3000
const app = express()

app.use(express.json())
app.use('/', (req, res, next) => {
  if (req.originalUrl === '/') {
    res.send('Service is running!')
  } else {
    next()
  }
})
app.use('/users', usersRouter)
app.use('/groups', groupsRouter)
app.use((req, res, next) => {
  next(createHttpError(404, 'Page not found'))
})
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (isErrorWithStatus(err)) {
    res.status(err.status)
    res.json({ message: err.message })
  } else {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500)
    res.json({ message })
  }
})

connectToSequelizePostgresql()
  .then(async () => {
    Users.belongsToMany(Groups, { through: UserGroups })
    Groups.belongsToMany(Users, { through: UserGroups })

    return await Promise.all([
      Users.sync(),
      Groups.sync(),
      UserGroups.sync()
    ])
  })
  .then(() => {
    app.listen(PORT, () => console.log(`App is running on http://localhost:${PORT}`))
  })
  .catch((error: unknown) => {
    console.error('error during connection to database(s)', error)
    process.exit(1)
  })
