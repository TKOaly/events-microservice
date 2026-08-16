import type { Knex } from 'knex'

/**
 * Up: Creates table `locations_translation`
 */
export async function up(knex: Knex): Promise<void> {
  if (!await knex.schema.hasTable('locations_translation')) {
    knex.schema.createTable('locations_translation', table => {
      table
        .foreign('location_id')
        .references('id')
        .inTable('locations')
        .primary()
      table.string('locale', 2).notNullable()
      table.string('name', 512).notNullable()

      // Indexes
      table.unique(['location_id', 'locale'], {
        indexName: 'locations_translation_unique_translation',
      })
    })
  }
}

/**
 * Down: removes table `locations_translation`
 */
export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTableIfExists('locations_translation')
}
