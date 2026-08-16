import type { Knex } from 'knex'

/**
 * Up: Creates table `registration_quota_translation`
 */
export async function up(knex: Knex): Promise<void> {
  if (!await knex.schema.hasTable('registration_quota_translation')) {
    knex.schema.createTable(
      'registration_quota_translation',
      table => {
        table
          .foreign('registration_quota_id')
          .references('id')
          .inTable('registration_quota')
        table.string('locale', 2).notNullable()
        table.string('name', 512)

        // Indexes
        table.unique(['registration_quota_id', 'locale'], {
          indexName: 'registration_quota_translation_unique_translation',
        })
      },
    )
  }
}
/**
 * Down: removes table `registration_quota_translation`
 */
export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTableIfExists('registration_quota_translation')
}
