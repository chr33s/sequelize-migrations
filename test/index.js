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
  const migration = require(`./fixtures/${table}.js`)
  const snapshot = readFileSync(`./snapshots/${table}.js`)

  let render = migrations.template.render({ migration })
  render = migrations.format(render)

  fs.writeFileSync(
    path.join(__dirname, `./snapshots/${table}.js`),
    render,
    'utf8'
  )

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
        .migrate({ to: '20171118132947783' })
        .then(m => assert.equal(m.length, 1))
        .then(() => migrations.migrate())
        .then(m => assert.equal(m.length, 7))
    })

    it('rollback', () => {
      return migrations
        .rollback()
        .then(m => assert.equal(m.length, 1))
        .then(() => migrations.rollback({ to: 0 }))
        .then(m => assert.equal(m.length, 7))
    })
    it('run', () => {
      return migrations
        .run('migrate', false)
        .then(m => assert(!m))
        .then(() => migrations.run('migrate', true))
        .then(m => assert.equal(m.length, 8))
    })
  })

  after(() => drop)
})
