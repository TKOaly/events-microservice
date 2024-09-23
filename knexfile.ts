import type { Knex } from 'knex'

if (!process.env.DB_URL) {
  throw new Error('DB_URL is not defined')
}

const DB_URL = new URL(process.env.DB_URL)

const config: { [key: string]: Knex.Config } = {
  production: {
    client: 'mysql2',
    connection: {
      host: DB_URL.hostname,
      port: Number(DB_URL.port),
      user: DB_URL.username,
      password: DB_URL.password,
      database: DB_URL.pathname.slice(1),
      typeCast: (field, next) => {
        if (field.type === 'DATETIME') {
          return field.string()?.replace(' ', 'T') ?? null
        }
        return next()
      },
    },
    migrations: {
      tableName: 'knex_migrations_events',
    },
  },
}

module.exports = config
export default config
