'use strict'

module.exports = {
  up: (query, DataTypes) =>
    query.addColumn('tests', 'age', {
      type: DataTypes.INTEGER({ length: 3 }),
      defaultValue: 1
    }),

  down: (query, DataTypes) => query.removeColumn('tests', 'age')
}
