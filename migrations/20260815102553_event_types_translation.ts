import type { Knex } from 'knex'

/**
 * Up: Creates table `event_types_translation`
 */
export async function up(knex: Knex): Promise<void> {
  if (!await knex.schema.hasTable('event_types_translation')) {
    knex.schema.createTable('event_types_translation', table => {
      table
        .foreign('event_type_id')
        .references('id')
        .inTable('event_types')
        .primary()
      table.string('locale', 2).notNullable()
      table.string('name', 512)

      // Indexes
      table.unique(['event_type_id', 'locale'], {
        indexName: 'event_types_translation_unique_translation',
      })
    })
  }
}

/**
 * Down: removes table `event_types_translation`
 */
export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTableIfExists('event_types_translation')
}
