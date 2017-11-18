'use strict'

module.exports = {
  up: (query, DataTypes) => query.removeColumn('tests', 'name'),

  down: (query, DataTypes) =>
    query.addColumn('tests', 'name', {
      type: DataTypes.STRING({})
    })
}
