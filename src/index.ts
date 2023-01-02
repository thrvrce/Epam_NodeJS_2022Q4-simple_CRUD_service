import express, { NextFunction, Response, Request } from 'express'

import { userRouter } from './resources/user/user.router'
import createHttpError, { isErrorWithStatus } from './utils/createHttpError'

const app = express()

app.use(express.json())

app.use('/', (req, res, next) => {
  if (req.originalUrl === '/') {
    res.send('Service is running!')
  } else {
    next()
  }
})

app.use('/users', userRouter)

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

const PORT = 3000
app.listen(PORT, () => console.log(`App is running on http://localhost:${PORT}`))
