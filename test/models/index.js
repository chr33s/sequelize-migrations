'use strict'

const Sequelize = require('sequelize')
const path = require('path')
const fs = require('fs')

const config = {
  define: { underscored: true, underscoredAll: true },
  database: 'sequelize-migrations',
  operatorsAliases: false,
  username: 'root',
  dialect: 'mysql',
  logging: false
}

const sequelize = new Sequelize(config)
const models = {}

fs
  .readdirSync(__dirname)
  .filter(
    file => !file.startsWith('.') && file.endsWith('.js') && file !== 'index.js'
  )
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file))
    model.init(sequelize)
    models[model.name] = model
  })

for (const model of Object.keys(models)) {
  const m = models[model]

  if ('associate' in m) {
    m.associate(models)
  }
}

module.exports = sequelize
