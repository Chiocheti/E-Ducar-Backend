import { Model } from "sequelize";
import { v4 as uuidv4 } from 'uuid';

import db from './';
import sequelize from "sequelize";

class Students extends Model {
  declare id: string;
  declare name: string;
  declare email: string;
  declare password: string;
  declare phone: string;
  declare image: string;
  declare refreshToken: string;
}

Students.init({
  id: {
    type: sequelize.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: sequelize.UUIDV4,
  },
  name: {
    type: sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: sequelize.STRING,
    allowNull: false,
  },
  phone: {
    type: sequelize.STRING,
    allowNull: false,
  },
  image: {
    type: sequelize.STRING,
    allowNull: false,
  },
  refreshToken: {
    type: sequelize.STRING,
    allowNull: true,
  },
}, {
  sequelize: db,
  tableName: 'students',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (item) => {
      item.id = uuidv4();
    }
  }
})

export default Students;