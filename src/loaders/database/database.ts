import { Sequelize } from 'sequelize'

// todo move to .env vars when time comes
export const sequelizePostgresql = new Sequelize('NodeJs2022Q4', 'postgres', 'postgres_password', {
  host: 'localhost',
  dialect: 'postgres'
})

export const connectToSequelizePostgresql = async () => {
  try {
    await sequelizePostgresql.authenticate()
    console.error('sequelizePostgresql authenticated')
  } catch (error) {
    console.error('sequelizePostgresql not authenticated')
    throw error
  }
}
