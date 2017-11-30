# Sequelize Migrations

> Sync migrations with Sequelize model changes in development Deploy diffed
> schema changes with a post[install, update] hook

## Install

`npm install --save @chr33s/sequelize-migrations`

## Usage

```sh
npm run migration --models=./models --migrations=./migrations --sync
npm run migration --models=./models --migrations=./migrations --migrate
npm run migration --models=./models --migrations=./migrations --rollback.to=0
```

## API

`const { Migration } = require('@chr33s/sequelize-migrations')`

### `migration = new Migration(options)`

Create a new Migration instance with `options`.

##### `options = {}`

```js
options = {
  path: './path/migrations/dir',
  sequelize
}
```

### `migrations.sync()`

Sync models changes to migration(s)

### `migrations.migrate(options = {})`

Migrate models changes to migration(s) with `options`.

### `migrations.rollback(options = {})`

Rollback models changes to migration(s) with `options`.

##### `options = {}`

Any valid [umzug](https://github.com/sequelize/umzug) option

## license

MIT. Copyright (c) [chr33s](https://github.com/chr33s).
