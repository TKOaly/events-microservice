import type { Knex } from 'knex'

/**
 * Up: Creates table `registration_quota`
 */
export async function up(knex: Knex): Promise<void> {
  knex.schema.createTableIfNotExists('registration_quota', table => {
    table.bigIncrements('id').unsigned().primary()
    table.foreign('event_id').references('id').inTable('events').notNullable()
    table.integer('max_participants', 10).notNullable()
    table.integer('realised_participants').nullable()

    // Indexes
    table.index('event_id')
  })
}

/**
 * Down: removes table `registration_quota`
 */
export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTableIfExists('registration_quota')
}
