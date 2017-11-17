#!/usr/bin/env node

'use strict'

const { Migration } = require('../')
const yargs = require('yargs')
const path = require('path')

const { argv } = yargs.demandOption(['models', 'migrations'])

const sequelize = require(path.join(process.cwd(), argv.models))

const migrations = new Migration({
  path: path.join(process.cwd(), argv.migrations),
  sequelize
})

sequelize
  .authenticate()
  .then(() => migrations.run('sync', argv.sync))
  .then(() => migrations.run('migrate', argv.migrate))
  .then(() => migrations.run('rollback', argv.rollback))
  .catch(console.error)
  .then(() => process.exit(0))
