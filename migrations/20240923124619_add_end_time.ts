import type { Knex } from 'knex'

/**
 * Up: Add a new column `ends` to the `calendar_events` table after the `starts` column
 */
export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('calendar_events', 'ends')

  if (!hasColumn) {
    await knex.schema.table('calendar_events', table => {
      table.datetime('ends').nullable().after('starts')
    })
  }
}

/**
 * Down: Drop the `ends` column from the `calendar_events` table
 */
export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('calendar_events', 'ends')

  if (hasColumn) {
    await knex.schema.table('calendar_events', table => {
      table.dropColumn('ends')
    })
  }
}
