'use strict'

module.exports = {
  up: (query, DataTypes) =>
    query.createTable('example', {
      id: {
        type: DataTypes.UUID(),
        defaultValue: DataTypes.UUIDV4(),
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      name: {
        type: DataTypes.STRING({ length: 123 })
      }
    }),

  down: (query, DataTypes) => query.dropTable('example')
}
