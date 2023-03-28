import { Sequelize } from 'sequelize'
import * as dotenv from 'dotenv'
dotenv.config()

export const sequelizePostgresql = new Sequelize(process.env.DATA_BASE ?? '', process.env.DATA_BASE_USER_NAME ?? '', process.env.DATA_BASE_PASSWORD ?? '', {
  host: 'localhost',
  dialect: 'postgres'
})

export const connectToSequelizePostgresql = async () => {
  try {
    await sequelizePostgresql.authenticate()
    console.log('sequelizePostgresql authenticated')
  } catch (error) {
    console.error('sequelizePostgresql not authenticated')
    throw error
  }
}
