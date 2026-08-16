import type { Knex } from 'knex'

/**
 * Up: Creates table `custom_fields`
 */
export async function up(knex: Knex): Promise<void> {
  if (!await knex.schema.hasTable('custom_fields')) {
    knex.schema.createTable('custom_fields', table => {
      table.bigIncrements('id').unsigned().primary()
      table
        .foreign('registration_id')
        .references('id')
        .inTable('registrations')
        .notNullable()
      table
        .foreign('custom_field_id')
        .references('id')
        .inTable('custom_fields')
        .notNullable()
      table.text('value').notNullable()

      // Indexes
      table.index('registration_id')
      table.index('custom_field_id')
    })
  }
}

/**
 * Down: removes table `custom_fields`
 */
export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTableIfExists('custom_fields')
}
