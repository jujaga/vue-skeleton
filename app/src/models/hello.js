const { Model } = require('objection');
const { UpdatedAt } = require('./mixins');

class Hello extends UpdatedAt(Model) {
  static get tableName() {
    return 'hello';
  }

  static get idColumn() {
    return 'helloId';
  }
}

module.exports = Hello;
