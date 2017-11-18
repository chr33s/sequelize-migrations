'use strict'

module.exports = {
  up: (query, DataTypes) =>
    query.createTable('tests', {
      id: {
        type: DataTypes.UUID(),
        defaultValue: DataTypes.UUIDV4(),
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      name: {
        type: DataTypes.STRING({})
      },
      description: {
        type: DataTypes.TEXT({}),
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE({}),
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE({}),
        allowNull: false
      }
    }),

  down: (query, DataTypes) => query.dropTable('tests')
}
