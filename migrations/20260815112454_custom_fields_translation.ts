import type { Knex } from 'knex'

/**
 * Up: Creates table `custom_fields_translation`
 */
export async function up(knex: Knex): Promise<void> {
  if (!await knex.schema.hasTable('custom_fields_translation')) {
    knex.schema.createTable('custom_fields_translation', table => {
      table.foreign('custom_field_id').references('id').inTable('custom_fields')
      table.string('locale', 2).notNullable()
      table.string('name', 512)

      // Indexes
      table.unique(['custom_field_id', 'locale'], {
        indexName: 'custom_fields_translation_unique_translation',
      })
    })
  }
}

/**
 * Down: removes table `custom_fields_translation`
 */
export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTableIfExists('custom_fields_translation')
}
