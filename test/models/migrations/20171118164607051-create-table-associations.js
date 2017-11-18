'use strict'

module.exports = {
  up: (query, DataTypes) =>
    query.createTable('associations', {
      id: {
        type: DataTypes.UUID(),
        defaultValue: DataTypes.UUIDV4(),
        primaryKey: true,
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.STRING({ length: 100 }),
        allowNull: false
      },
      age: {
        type: DataTypes.INTEGER({ length: 3 }),
        defaultValue: 1
      },
      created_at: {
        type: DataTypes.DATE({}),
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE({}),
        allowNull: false
      },
      test_id: {
        type: DataTypes.UUID(),
        allowNull: true,
        references: { key: 'id', model: 'tests' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      }
    }),

  down: (query, DataTypes) => query.dropTable('associations')
}
