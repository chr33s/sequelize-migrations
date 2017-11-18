'use strict'

module.exports = {
  up: (query, DataTypes) =>
    query.changeColumn('example', 'description', {
      type: DataTypes.STRING()
    }),

  down: (query, DataTypes) =>
    query.changeColumn('example', 'description', {
      type: DataTypes.TEXT()
    })
}
