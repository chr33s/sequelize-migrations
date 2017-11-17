'use strict'

const sequelize = require('./models')
const { Migration } = require('../')
const path = require('path')

const migrations = new Migration({
  path: path.join(__dirname, 'models', 'migrations'),
  sequelize
})

sequelize
  .authenticate()
  .then(() => migrations.sync()) // development
  .then(() => migrations.run())
  // .then(() => migrations.rollback({ to: 0 }))
  .catch(console.error)
  .then(() => process.exit(0))
