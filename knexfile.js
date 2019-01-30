// Update with your config settings.
require('dotenv').config()
module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: 'wdhr_dev',
      user:     'postgres',
      password: 'postgres'
    },
    seeds: {
      directory: './seeds/development',
      loadExtensions: ['.js']
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'wdhr_staging',
      user:     'postgres',
      password: 'postgres'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: process.env.POSTGRES_DATABASE,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds/production'
    }
  }

};
