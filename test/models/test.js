'use strict'

const { DataTypes, Model } = require('sequelize')

class Test extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
          unique: true,
          validate: {
            isUUID: 4
          }
        },
        name: DataTypes.STRING,
        description: {
          type: DataTypes.TEXT,
          allowNull: false
        }
      },
      { sequelize }
    )
  }
}

module.exports = () => Test
