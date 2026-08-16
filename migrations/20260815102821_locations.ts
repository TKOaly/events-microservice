import type { Knex } from 'knex'

/**
 * Up: Creates table `locations`
 */
export async function up(knex: Knex): Promise<void> {
  knex.schema.createTableIfNotExists('locations', table => {
    table.bigIncrements('id').unsigned().primary()
    table.text('map_link')
    table.boolean('deleted').defaultTo(false)
  })
}

/**
 * Down: removes table `locations`
 */
export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTableIfExists('locations')
}
