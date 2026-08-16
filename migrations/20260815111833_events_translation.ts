import type { Knex } from 'knex'

/**
 * Up: Creates table `events_translation`
 */
export async function up(knex: Knex): Promise<void> {
  knex.schema.createTableIfNotExists('events_translation', table => {
    table.foreign('event_id').references('id').inTable('events').primary()
    table.string('locale', 2).notNullable()
    table.string('title', 1024).nullable()
    table.text('description').nullable()

    // Indexes
    table.unique(['event_id', 'locale'], {
      indexName: 'events_translation_unique_translation',
    })
  })
}

/**
 * Down: removes table `events_translation`
 */
export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTableIfExists('events_translation')
}
