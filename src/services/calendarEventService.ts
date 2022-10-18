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

type Registration = {
  user_id: number
  answers: Array<{ question_id: number, question: string, answer: string }>,
}

const formatRegistrationAnswer = (answer) => ({
  question_id: answer.custom_field_id,
  question: answer.name,
  answer: answer.value,
})

const formatCustomField = (custom_field) => ({
  id: custom_field.id,
  name: custom_field.name,
  type: custom_field.type,
  options: custom_field.options.split(';').map(option => option.trim()),
})

type CustomField = {
  id: number
  name: string
  type: 'textarea' | 'radio' | 'checkbox' | 'text'
  options: string[]
}

export async function getCustomFieldsForCalendarEventId(
  eventId: number
): Promise<Array<CustomField>> {
  const fields = await db
    .select('custom_fields.*')
    .from('custom_fields')
    .where('custom_fields.calendar_event_id', '=', eventId);

  return R.map(formatCustomField, fields)
}

export async function getRegistrationsForCalendarEventId(
  eventId: number
): Promise<Array<Registration>> {
  const registrations = await db
    .select('registrations.*', 'users.id as user_id')
    .from('registrations')
    .join(
      'users',
      'users.id',
      '=',
      'registrations.user_id'
    )
    .where('registrations.calendar_event_id', eventId)

  const answers = await db
    .select(
      'custom_field_answers.value',
      'custom_field_answers.registration_id',
      'custom_fields.name',
      'custom_fields.id as custom_field_id'
    )
    .from('custom_field_answers')
    .join(
      'custom_fields',
      'custom_fields.id',
      '=',
      'custom_field_answers.custom_field_id',
    )
    .where('custom_field_answers.registration_id', 'IN', registrations.map(r => r.id))

  const answersByRegistrationId = new Map();

  answers.forEach((answer) => {
    if (!answersByRegistrationId.has(answer.registration_id)) {
      answersByRegistrationId.set(answer.registration_id, [answer]);
    } else {
      answersByRegistrationId.get(answer.registration_id).push(answer);
    }
  })

  return registrations.map((registration) => {
    const answers = answersByRegistrationId.get(registration.id) ?? []

    return {
      id: registration.id,
      user_id: registration.user_id,
      created: registration.created,
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      answers: R.map(formatRegistrationAnswer, answers),
    }
  })
}

function parseQueryResult(row: any): CalendarEvent {
  return R.pick<CalendarEvent, any>(
    [
      'id',
      'name',
      'user_id',
      'price',
      'created',
      'starts',
      'registration_starts',
      'registration_ends',
      'cancellation_starts',
      'cancellation_ends',
      'organizer',
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
