'use strict'

module.exports = {
  up: (query, DataTypes) => Promise.all([
    query.addColumn(
      'example',
      'description',
      {
        type: DataTypes.TEXT(),
        allowNull: false,
      },
    ),
    query.changeColumn(
      'example',
      'name',
      {
        type: DataTypes.TEXT(),
        allowNull: false,
      },
    ),
    query.removeColumn(
      'example',
      'id',
    ),
  ]),
  
  down: (query, DataTypes) => Promise.all([
    query.removeColumn(
      'example',
      'description',
    ),
    query.changeColumn(
      'example',
      'name',
      {
        type: DataTypes.STRING(),
        allowNull: false,
      },
    ),
    query.addColumn(
      'example',
      'id',
      {
        type: DataTypes.UUID(),
        defaultValue: DataTypes.UUIDV4(),
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
    ),
  ])
}
