module.exports = {
  up: {
    Table: {
      create: {
        example: {
          id: {
            type: {
              key: "UUID"
            },
            defaultValue: {
              key: "UUIDV4"
            },
            primaryKey: true,
            allowNull: false,
            unique: true
          },
          name: {
            type: {
              key: "STRING",
              options: {
                length: 123
              }
            }
          }
        }
      }
    }
  },
  down: {
    Table: {
      drop: {
        example: null
      }
    }
  }
}
