module.exports = {
  up: {
    Column: {
      change: {
        example: {
          description: {
            type: {
              key: 'STRING',
              allowNull: false
            }
          }
        }
      }
    }
  },
  down: {
    Column: {
      change: {
        example: {
          description: {
            type: {
              key: 'TEXT',
              allowNull: false
            }
          }
        }
      }
    }
  }
}
