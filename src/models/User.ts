import { Model } from "sequelize";
import { v4 as uuidv4 } from 'uuid';

import db from './';
import sequelize from "sequelize";

class User extends Model {
  declare id: string;
  declare name: string;
  declare username: string;
  declare password: string;
  declare isTeacher: boolean;
  declare refreshToken: string;
  declare image: string;
}

User.init({
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
  username: {
    type: sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: sequelize.STRING,
    allowNull: false,
  },
  isTeacher: {
    type: sequelize.BOOLEAN,
    allowNull: false,
  },
  refreshToken: {
    type: sequelize.STRING,
    allowNull: true,
  },
  image: {
    type: sequelize.STRING,
    allowNull: false,
  },
}, {
  sequelize: db,
  tableName: 'users',
  timestamps: false,
  underscored: true,
  hooks: {
    beforeCreate: (item) => {
      item.id = uuidv4();
    }
  }
})

export default User;
