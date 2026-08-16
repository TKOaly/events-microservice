import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('events'))) {
    knex.schema.createTable('events', table => {
      table.bigIncrements('id').primary()
      table.integer('user_id').unsigned().nullable()
      table.datetime('created').nullable()
      table.datetime('starts').nullable()
      table.datetime('registration_starts').nullable()
      table.datetime('registration_ends').nullable()
      table.datetime('cancellation_starts').nullable()
      table.datetime('cancellation_ends').nullable()
      table.tinyint('alcohol_meter', 2).nullable()
      table
        .foreign('location_id')
        .references('id')
        .inTable('locations')
        .unsigned()
        .nullable()
      table
        .integer('type_id')
        .references('id')
        .inTable('event_types')
        .unsigned()
        .nullable()
      table.text('price').nullable()
      table.text('map').nullable()
      table.boolean('membership_required').nullable()
      table.boolean('outsiders_allowed').nullable()
      table.boolean('template').nullable()
      table.string('responsible', 100).nullable()
      table.boolean('show_responsible').nullable()
      table.boolean('avec').nullable()
      table.boolean('deleted').defaultTo(false)

      // Indexes
      table.index('user_id')
      table.index('deleted')
      table.index('template')
      table.index('starts')
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('events'))) {
    knex.schema.dropTable('events')
  }
}
