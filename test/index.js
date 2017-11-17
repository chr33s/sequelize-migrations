'use strict'

const { Template } = require('nunjucks')
const sequelize = require('./models')
const { Migration } = require('../')
const assert = require('assert')
const path = require('path')
const fs = require('fs')

const migrations = new Migration({
  path: path.join(__dirname, 'models', 'migrations'),
  sequelize
})

const drop = sequelize.getQueryInterface().dropAllTables()

const readFileSync = file => fs.readFileSync(path.join(__dirname, file), 'utf8')

const meta = table => {
  const template = readFileSync(`../template/${table}.njk`)
  const props = readFileSync(`./fixtures/${table}.json`)
  const snapshot = readFileSync(`./snapshots/${table}.js`)

  const render = new Template(template).render(JSON.parse(props))

  return { snapshot, render }
}

describe('testing', function() {
  before(() => drop)

  describe('meta', function() {
    it('table', () => {
      const { snapshot, render } = meta('table')
      assert.equal(snapshot, render)
    })

    it('column', () => {
      const { snapshot, render } = meta('column')
      assert.equal(snapshot, render)
    })
  })

  describe('migration', function() {
    it('schema', () => {
      const _schema = migrations.read('schema.json')
      const schema = migrations.stringify(migrations.schema())

      assert.deepStrictEqual(JSON.parse(_schema), JSON.parse(schema))
    })

    it('sync')

    it('migrate', () => {
      return migrations
        .migrate({ to: '20171116141834201' })
        .then(m => assert.equal(m.length, 1))
        .then(() => migrations.migrate())
        .then(m => assert.equal(m.length, 5))
    })

    it('rollback', () => {
      return migrations
        .rollback()
        .then(m => assert.equal(m.length, 1))
        .then(() => migrations.rollback({ to: 0 }))
        .then(m => assert.equal(m.length, 5))
    })
    it('run', () => {
      return migrations
        .run('migrate', false)
        .then(m => assert(!m))
        .then(() => migrations.run('migrate', true))
        .then(m => assert.equal(m.length, 6))
    })
  })

  after(() => drop)
})
