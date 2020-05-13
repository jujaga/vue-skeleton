/**
 * @module KnexConnection
 *
 * Create and check the connection for data persistence.
 * Default is Postgresql using Knex.
 *
 * @see Knex
 * @see Objection
 *
 * @exports KnexConnection
 */
const Knex = require('knex');
const knexfile = require('../../knexfile');
const log = require('npmlog');
const { Model } = require('objection');

class KnexConnection {
  /**
   * Creates a new KnexConnection singleton with default (Postgresql) Knex configuration.
   * @class
   */
  constructor() {
    if (!KnexConnection.instance) {
      this.knex = Knex(knexfile);
      KnexConnection.instance = this;
    }

    return KnexConnection.instance;
  }

  /**
   * @function connected
   * True or false if connected.
   */
  get connected() {
    return this._connected;
  }

  /**
   * @function knex
   * Gets the current knex binding
   */
  get knex() {
    return this._knex;
  }

  /**
   * @function knex
   * Sets the current knex binding
   * @param {object} v - a Knex object.
   */
  set knex(v) {
    this._knex = v;
    this._connected = false;
  }

  /**
   * @function checkAll
   * Checks the Knex connection, the database schema, and Objection models
   * @returns {boolean} True if successful, otherwise false
   */
  async checkAll() {
    const connectOk = await this.checkConnection();
    const schemaOk = await this.checkSchema();
    const modelsOk = this.checkModel();

    log.debug('KnexConnection.checkAll', `Connect OK: ${connectOk}, Schema OK: ${schemaOk}, Models OK: ${modelsOk}`);
    this._connected = connectOk && schemaOk && modelsOk;
    return this._connected;
  }

  /**
   * @function checkConnection
   * Checks the current knex connection to Postgres
   * @returns {boolean} True if successful, otherwise false
   */
  async checkConnection() {
    try {
      const data = await this._knex.raw('SELECT 1+1 AS result');
      const result = data && data.rows && data.rows[0].result === 2;
      if (result) log.verbose('KnexConnection.checkConnection', 'Database connection ok');
      return result;
    } catch (err) {
      log.error('KnexConnection.checkConnection', `Error with database connection: ${err.message}`);
      return false;
    }
  }

  /**
   * @function checkSchema
   * Queries the knex connection to check for the existence of the expected schema tables
   * @returns {boolean} True if schema is ok, otherwise false
   */
  checkSchema() {
    const tables = ['hello'];
    try {
      return Promise
        .all(tables.map(table => this._knex.schema.hasTable(table)))
        .then(exists => exists.every(x => x))
        .then(result => {
          if (result) log.verbose('KnexConnection.checkSchema', 'Database schema ok');
          return result;
        });
    } catch (err) {
      log.error('KnexConnection.checkSchema', `Error with database schema: ${err.message}`);
      log.error('KnexConnection.checkSchema', err);
      return false;
    }
  }

  /**
   * @function checkModel
   * Attaches the Objection model to the existing knex connection
   * @returns {boolean} True if successful, otherwise false
   */
  checkModel() {
    try {
      Model.knex(this.knex);
      log.verbose('KnexConnection.checkModel', 'Database models ok');
      return true;
    } catch (err) {
      log.error('KnexConnection.checkModel', `Error attaching Model to connection: ${err.message}`);
      log.error('KnexConnection.checkModel', err);
      return false;
    }
  }
}

module.exports = KnexConnection;
