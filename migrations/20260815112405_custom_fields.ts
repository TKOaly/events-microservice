import type { Knex } from 'knex'

/**
 * Up: Creates table `custom_fields`
 */
export async function up(knex: Knex): Promise<void> {
  if (!await knex.schema.hasTable('custom_fields')) {
    knex.schema.createTable('custom_fields', table => {
      table.bigIncrements('id').unsigned().primary()
      table.foreign('event_id').references('id').inTable('events').notNullable()
      table
        .foreign('registration_quota_id')
        .references('id')
        .inTable('registration_quota')
        .nullable()
      table.string('type', 20).notNullable()
      table.text('options').nullable()
      table.boolean('required').nullable()

      // Indexes
      table.index('event_id')
    })
  }
}

/**
 * Down: removes table `custom_fields`
 */
export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTableIfExists('custom_fields')
}
