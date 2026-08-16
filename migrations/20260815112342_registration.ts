import type { Knex } from 'knex'

/**
 * Up: Creates table `registration`
 */
export async function up(knex: Knex): Promise<void> {
  knex.schema.createTableIfNotExists('registration', table => {
    table.bigIncrements('id').unsigned().primary()
    table.integer('user_id').unsigned().nullable()
    table.integer('event_id').unsigned().nullable()
    table.foreign('avec_registration_id').references('id').inTable('registration').nullable()
    table.foreign('registration_quota_id').references('id').inTable('registration_quota').nullable()
    table.datetime('created').nullable()
    table.string('name', 255).nullable()
    table.string('email', 255).nullable()
    table.string('phone', 255).nullable()
    table.datetime('paid').nullable()
    table.boolean('name_can_be_public').nullable()
    table.boolean('accepted_privacy_policy').defaultTo(false)

    // Indexes
    table.unique(['id', 'user_id'])
    table.unique(['user_id', 'event_id'])
    table.index('avec_registration_id')
    table.index('calendar_event_id')
  })
}

/**
 * Down: removes table `registration`
 */
export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTableIfExists('registration')
}
