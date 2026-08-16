import type { Knex } from "knex";

/**
 * Up: Creates table `event_types`
 */
export async function up(knex: Knex): Promise<void> {
  knex.schema.createTableIfNotExists('event_types', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.tinyint('implicit_alcohol_meter', 2).nullable();
    table.boolean('deleted').defaultTo(false)
  })
}

/**
 * Down: removes table `event_types`
 */
export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTableIfExists('event_types')
}
