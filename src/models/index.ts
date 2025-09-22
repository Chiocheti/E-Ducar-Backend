import { Sequelize } from 'sequelize';

import databaseConfig from '../config/database';

const sequelize = new Sequelize(databaseConfig);

export default sequelize;
