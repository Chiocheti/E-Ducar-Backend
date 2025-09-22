import 'dotenv/config';
import { Dialect, Options } from 'sequelize';

const { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT, DB_DIALECT } =
  process.env;

const databaseConfig: Options = {
  username: DB_USER || 'root',
  password: DB_PASSWORD || '',
  database: DB_NAME || 'database_dev',
  host: DB_HOST || '127.0.0.1',
  port: Number(DB_PORT) || 3306,
  dialect: (DB_DIALECT as Dialect) || 'mysql',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  timezone: '-03:00',
};

export = databaseConfig;
