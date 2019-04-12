'use strict'

const { Template } = require('nunjucks')
const { diff } = require('deep-diff')
const prettier = require('prettier')
const { join } = require('path')
const Umzug = require('umzug')
const fs = require('fs')

class Migration {
  constructor(options) {
    const { path = 'migrations', sequelize } = options || {}

    if (!this.exists(path)) throw new Error(`${path} does not exists`)

    this.path = path
    this.sequelize = sequelize
    this.template = this.template()
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
      parser: 'babel',
      semi: false
    })
  }

  template() {
    const file = fs.readFileSync('./index.njk', 'utf8')
    return new Template(file)
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

  reverse(up, _schema) {
    const down = {}

    for (const Type in up) {
      const types = up[Type]

      down[Type] = {}

      for (let action in types) {
        const actions = this.clone(types[action])

        switch (action) {
          case 'create':
            action = 'drop'
            break
          case 'add':
            action = 'remove'
            break
          case 'change':
            // invert changes
            for (const table in actions) {
              const attributes = actions[table]

              for (const attribute in attributes) {
                actions[table][attribute] = _schema[table][attribute]
              }
            }
            break
          case 'remove':
            action = 'add'
            break
          case 'drop':
            action = 'create'
            break
        }

        down[Type][action] = actions
      }
    }

    return down
  }

  clone(obj) {
    return this.parse(this.stringify(obj)) // !Object.assign nested references
  }

  name(migration) {
    let path
    for (const Type in migration) {
      for (let action in migration[Type]) {
        for (let table in migration[Type][action]) {
          path = `${this.timestamp}-${action}-${Type.toLowerCase()}-${table}.js`
        }
      }
    }
    return path
  }

  sync() {
    const schema = this.schema()
    const _schema = this.parse(this.read('schema.json'))
    const differences = diff(_schema, this.parse(this.stringify(schema))) || [] // JSON.* -> rm: undefined

    for (const d of differences) {
      const [table, field, name, prop, attr] = d.path
      let migration = {}

      switch (d.kind) {
        case 'N':
          if (!field) {
            if (!migration.Table) migration.Table = {}
            if (!migration.Table.create) migration.Table.create = {}

            migration.Table.create[table] = d.rhs
          } else {
            if (attr) break // FIXME

            if (!migration.Column) migration.Column = {}
            if (!migration.Column.add) migration.Column.add = {}

            migration.Column.add[table] = {
              [field]: d.rhs
            }
          }
          break
        case 'D':
          if (!field) {
            if (!migration.Table) migration.Table = {}
            if (!migration.Table.drop) migration.Table.drop = {}

            migration.Table.drop[table] = d.lhs
          } else {
            if (attr) break // FIXME

            if (!migration.Column) migration.Column = {}
            if (!migration.Column.remove) migration.Column.remove = {}

            migration.Column.remove[table] = {
              [field]: d.lhs
            }
          }
          break
        case 'E':
          if (field) {
            if (!migration.Column) migration.Column = {}
            if (!migration.Column.change) migration.Column.change = {}

            migration.Column.change[table] = {
              [field]: this.clone(schema[table][field])
            }
          }
          break
        case 'A':
          console.log('A', table, field, name, prop, attr, d)
          break
      }

      let path = this.name(migration)
      migration = { up: migration, down: this.reverse(migration, _schema) }
      const template = this.template.render({ migration })
      migration = this.format(template)

      this.write(path, migration)
    }

    this.write('schema.json', this.stringify(schema))
  }

  run(fn, options) {
    if (options && this[fn]) return this[fn](options)

    return Promise.resolve(false)
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
