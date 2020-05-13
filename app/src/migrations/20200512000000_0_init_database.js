const helloTable = 'hello';

exports.up = knex => {
  return knex.schema.createTable(helloTable, t => {
    t.uuid('helloId').primary();
    t.timestamp('createdAt', { useTz: true }).defaultTo(knex.fn.now());
    t.timestamp('updatedAt', { useTz: true }).defaultTo(knex.fn.now());
    t.timestamp('deletedAt', { useTz: true });
    t.string('message').notNullable();
  });
};

exports.down = knex => {
  return knex.schema.dropTableIfExists(helloTable);
};
