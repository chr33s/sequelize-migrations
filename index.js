'use strict'

const { Environment, Template } = require('nunjucks')
const { diff } = require('deep-diff')
const prettier = require('prettier')
const { join } = require('path')
const Umzug = require('umzug')
const fs = require('fs')

const create = `
'use strict'

module.exports = {
  up: (query, DataTypes) => query.createTable('{{ table }}', {
    {% for field, option in options -%}
      {{ field }}: {
        {% for key, val in option -%}
          {{ key }}:
            {% if key|DataType(val) -%}
              DataTypes.{{ val.key }}({{ val.options|dump|safe }}),
            {% else %}
              {{ val|dump|safe }},
            {% endif %}
        {%- endfor %}
      },
    {% endfor %}
  }),

  down: (query, DataTypes) => query.dropTable('{{ table }}')
}
`

const remove = `
'use strict'

module.exports = {
  up: (query, DataTypes) => query.dropTable('{{ table }}'),

  down: (query, DataTypes) => query.createTable('{{ table }}', {
    {% for field, option in options -%}
      {{ field }}: {
        {% for key, val in option -%}
          {{ key }}:
            {% if key|DataType(val) -%}
              DataTypes.{{ val.key }}({{ val.options|dump|safe }}),
            {% else %}
              {{ val|dump|safe }},
            {% endif %}
        {%- endfor %}
      },
    {% endfor %}
  })
}
`

class Migration {
  constructor(options) {
    const { path = 'migrations', sequelize, log = false } = options || {}

    if (!this.exists(path)) throw new Error(`${path} does not exists`)

    this.log = log
    this.path = path
    this.sequelize = sequelize
    this.templates = { create, remove }
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
      // 'references',
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

              schema[table][column][property] = {
                key: val.key,
                options: val.options
              }
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

  dataType(key, val) {
    return (
      typeof val === 'object' &&
      val !== null &&
      ['type', 'defaultValue'].includes(key)
    )
  }

  template(type) {
    const env = new Environment()

    env.addFilter('DataType', this.dataType)

    return new Template(this.templates[type], env)
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
    const schema = this.stringify(this.schema())
    const _schema = this.read('schema.json')
    const _diff = diff(this.parse(_schema), this.parse(schema)) // JSON.parse -> rm: undefined
    const batch = {}

    for (let i in _diff) {
      let d = _diff[i]
      let [table, field] = d.path

      switch (d.kind) {
        case 'N':
          if (!field) {
            batch[table] = {
              action: 'create',
              options: d.rhs
            }
          }
          break
        case 'D':
          if (!field) {
            if (!batch[table]) {
              batch[table] = {
                action: 'remove',
                options: {}
              }
            }
            batch[table].options = d.lhs
          }
          break
        case 'E':
          break
        case 'A':
          break
      }
    }

    for (let table in batch) {
      let { action, options } = batch[table]

      const template = this.template(action).render({ table, options })
      const path = `${this.timestamp}-${action}-${table}.js`
      const migration = this.format(template)

      this.write(path, migration)
    }

    this.write('schema.json', schema)
  }

  run(options) {
    return this.umzug.up(options)
  }

  rollback(options) {
    return this.umzug.down(options)
  }
}

module.exports = options => new Migration(options)
module.exports.Migration = Migration
