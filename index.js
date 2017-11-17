'use strict'

const { Template } = require('nunjucks')
const { diff } = require('deep-diff')
const prettier = require('prettier')
const { join } = require('path')
const Umzug = require('umzug')
const fs = require('fs')

const templates = {
  table: fs.readFileSync('./template/table.njk', 'utf8'),
  column: fs.readFileSync('./template/column.njk', 'utf8')
}

class Migration {
  constructor(options) {
    const { path = 'migrations', sequelize } = options || {}

    if (!this.exists(path)) throw new Error(`${path} does not exists`)

    this.path = path
    this.sequelize = sequelize
    this.templates = templates
    this.log = sequelize.options.logging
    this.timestamp = new Date().toISOString().replace(/[^\d]/g, '')
    this.umzug = new Umzug({
      logging: this.log,
      storage: 'sequelize',
      storageOptions: { sequelize },
      migrations: {
        params: [
          sequelize.getQueryInterface(), // query
          sequelize.constructor // DataTypes
        ],
        path: this.path
      }
    })
    this.attributes = [
      'type',
      'unique',
      'allowNull',
      'primaryKey',
      'autoIncrement',
      'defaultValue',
      'references',
      'onDelete',
      'onUpdate'
    ]
  }

  schema() {
    const schema = {}

    const models = this.sequelize.models

    for (let name in models) {
      let model = models[name]
      let table = model.tableName

      schema[table] = {}

      let attributes = model.attributes

      for (let column in attributes) {
        schema[table][column] = {}

        let attribute = attributes[column]

        for (let property in attribute) {
          if (this.attributes.includes(property)) {
            let val = attribute[property]

            if (val && val['key']) {
              if (['VIRTUAL'].includes(val.key)) {
                delete schema[table][column]
                continue
              }

              const { key, model, options } = val
              schema[table][column][property] = { key, model, options }
            } else {
              schema[table][column][property] = val
            }
          }
        }
      }
    }

    return schema
  }

  format(template) {
    return prettier.format(template, {
      singleQuote: true,
      semi: false
    })
  }

  template(type) {
    return new Template(this.templates[type])
  }

  stringify(json) {
    return JSON.stringify(json, null, 2)
  }

  parse(str) {
    return JSON.parse(str) || {}
  }

  exists(path) {
    return fs.existsSync(path)
  }

  read(file) {
    const path = join(this.path, file)

    if (!this.exists(path)) return null

    return fs.readFileSync(path, 'utf8')
  }

  write(file, migration) {
    const path = join(this.path, file)

    return fs.writeFileSync(path, migration, 'utf8')
  }

  sync() {
    const schema = this.schema()
    const _schema = this.read('schema.json')
    const _diff = diff(this.parse(_schema), this.parse(this.stringify(schema))) // JSON.parse -> rm: undefined
    const batch = {}

    for (let i in _diff) {
      let d = _diff[i]
      let [table, field, name, prop, attr] = d.path

      console.log(table, field, name, prop, attr, d)

      if (!batch[table]) {
        batch[table] = {
          options: []
        }
      }

      switch (d.kind) {
        case 'N':
          if (!field) {
            batch[table].action = 'table'
            batch[table].options = d.rhs
          } else {
            if (attr) break

            batch[table].action = 'column'
            batch[table].options.push({
              action: 'add',
              options: d.rhs,
              name: field
            })
          }
          break
        case 'D':
          if (!field) {
            batch[table].create = false
            batch[table].action = 'table'
            batch[table].options = d.lhs
          } else {
            if (attr) break

            batch[table].action = 'column'
            batch[table].options.push({
              action: 'remove',
              options: d.lhs,
              name: field
            })
          }
          break
        case 'E':
          if (field) {
            batch[table].action = 'column'
            batch[table].options.push({
              action: 'change',
              options: {
                [name]: {
                  key: name === 'type' ? schema[table][field].type.key : null,
                  [`_${prop}`]: d.lhs,
                  [prop]: d.rhs
                }
              },
              name: field
            })
          }
          break
        case 'A':
          break
      }
    }

    for (let table in batch) {
      let { create = true, action, options } = batch[table]

      console.log(table, action, options)

      const template = this.template(action).render({ create, table, options })
      const path = `${this.timestamp}-${action}-${table}.js`
      const migration = this.format(template)

      this.write(path, migration)
    }

    this.write('schema.json', this.stringify(schema))
  }

  run(fn, options) {
    if (options && this[fn]) return this[fn](options)

    return Promise.resolve()
  }

  migrate(options) {
    return this.umzug.up(options)
  }

  rollback(options) {
    return this.umzug.down(options)
  }
}

module.exports = options => new Migration(options)
module.exports.Migration = Migration
