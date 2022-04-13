import * as knex from 'knex'
import * as R from 'ramda'
import * as moment from 'moment'

export interface CalendarEvent {
  id: number
  name: string
  user_id: number
  created: Date
  starts: Date
  registration_starts: Date
  registration_ends: Date
  cancellation_starts: Date
  cancellation_ends: Date
  location: string
  category: string
  description: string
  deleted: boolean
}

const db = knex({
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    typeCast: (field, next) => {
      if (field.type === 'DATETIME') {
        return field.string()?.replace(' ', 'T') ?? null
      }
      return next()
    },
  },
  client: 'mysql2',
})

export async function getAllCalendarEvents(
  fromDate: string
): Promise<CalendarEvent[]> {
  const query = db('calendar_events').select()

  // Sort by start date
  query.orderBy('starts', 'asc')

  // Delete deleted events and templates
  query.where('deleted', '0').where('template', '0')

  if (fromDate) {
    query.where(
      'starts',
      '>=',
      moment(new Date(fromDate)).format('YYYY.MM.DD HH:mm')
    )
  }
  return query.then(R.map(parseQueryResult))
}

export async function getEventsForUserId(
  userId: number
): Promise<Array<CalendarEvent & { price: string }>> {
  return db
    .select('calendar_events.*')
    .from('registrations')
    .innerJoin(
      'calendar_events',
      'calendar_events.id',
      '=',
      'registrations.calendar_event_id'
    )
    .where({ 'registrations.user_id': userId })
    .then(result => R.map(parseUserEventsQueryResult, result))
}

function parseQueryResult(row: any): CalendarEvent {
  return R.pick<CalendarEvent, any>(
    [
      'id',
      'name',
      'user_id',
      'created',
      'starts',
      'registration_starts',
      'registration_ends',
      'cancellation_starts',
      'cancellation_ends',
      'location',
      'category',
      'description',
      'deleted',
    ],
    row
  )
}

function parseUserEventsQueryResult(
  row: any
): CalendarEvent & { price: string } {
  return { ...parseQueryResult(row), price: row.price as string }
}
