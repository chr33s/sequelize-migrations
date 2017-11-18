'use strict'

module.exports = {
  up: (query, DataTypes) =>
    query.changeColumn('tests', 'description', {
      type: DataTypes.STRING({}),
      allowNull: false
    }),

  down: (query, DataTypes) =>
    query.changeColumn('tests', 'description', {
      type: DataTypes.TEXT({}),
      allowNull: false
    })
}
