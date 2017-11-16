'use strict'

module.exports = {
  up: (query, DataTypes) =>
    query.createTable('sequelize_meta', {
      name: {
        type: DataTypes.STRING({}),
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: false
      }
    }),

  down: (query, DataTypes) => query.dropTable('sequelize_meta')
}
