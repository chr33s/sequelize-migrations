'use strict'

const { DataTypes, Model } = require('sequelize')

class Association extends Model {
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
        description: {
          type: DataTypes.STRING(100),
          allowNull: false
        },
        age: {
          type: DataTypes.INTEGER(3),
          defaultValue: 1
        }
      },
      { sequelize }
    )
  }

  static associate(models) {
    Association.belongsTo(models.Test)
  }
}

module.exports = () => Association
