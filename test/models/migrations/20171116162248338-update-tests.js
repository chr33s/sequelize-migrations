'use strict'

module.exports = {
  up: (query, DataTypes) =>
    Promise.all([
      query.removeColumn('tests', 'name'),
      query.changeColumn('tests', 'description', {
        type: DataTypes.STRING()
      }),
      query.addColumn('tests', 'age', {
        type: DataTypes.INTEGER({ length: 3 }),
        defaultValue: 1
      })
    ]),

  down: (query, DataTypes) =>
    Promise.all([
      query.addColumn('tests', 'name', {
        type: DataTypes.STRING({})
      }),
      query.changeColumn('tests', 'description', {
        type: DataTypes.TEXT()
      }),
      query.removeColumn('tests', 'age')
    ])
}
