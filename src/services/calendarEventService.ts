import knex from 'knex'
import config from '../../knexfile'
import { pick } from 'remeda'
import moment from 'moment'
import * as z from 'zod'

// ikävä interface, ei kata kaikkia rivejä tietokannassa
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
  organizer: EventOrganizer | null
}

export const EventSchema = z.object ({
  user_id:                z.number().optional(),
  name:                   z.string(),
  created:                z.coerce.date().optional(),
  starts:                 z.coerce.date().optional(),
  registration_starts:    z.coerce.date().optional(),
  registration_ends:      z.coerce.date().optional(),
  cancellation_starts:    z.coerce.date().optional(),
  cancellation_ends:      z.coerce.date().optional(),
  location:               z.string().optional(),
  category:               z.string().optional(),
  description:            z.string().optional(),
  alcohol_meter:          z.number().optional(),
  price:                  z.string().optional(),
  map:                    z.string().optional(),
  max_participants:       z.number().optional(),
  realised_participants:  z.number().optional(),
  membership_required:    z.coerce.boolean().optional(),
  outsiders_allowed:      z.coerce.boolean().optional(),
  template:               z.coerce.boolean().optional(),
  responsible:            z.string().optional(),
  show_responsible:       z.coerce.boolean().optional(),
  avec:                   z.coerce.boolean().optional(),
  deleted:                z.coerce.boolean().optional(),
});

type Event = z.infer<typeof EventSchema>;

export interface EventOrganizer {
  name: string
  url: string | null
}

const db = knex(config.production)

export async function getAllCalendarEvents(
  fromDate?: string
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
  return query.then(r => r.map(parseQueryResult))
}

export const isExistingEvent = async (id: number): Promise<boolean> => {
  const res = await db('calendar_events').where({ id }).select(1).first();
  return !!res
}

export const addNewEvent = async (event: Event): Promise<number> => {
  return await db('calendar_events').insert(event, 'id')
}

export const updateEvent = async (id: number, event: Event): Promise<number> => {
  await db('calendar_events').where("id", id).update(event)
  return id
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
    .then(result => result.map(parseUserEventsQueryResult))
}

type Answer = { question_id: number; question: string; answer: string }

type Registration = {
  user_id: number
  answers: Array<Answer>
}

type DbAnswer = { custom_field_id: number; name: string; value: string }

const formatRegistrationAnswer = (answer: DbAnswer) => ({
  question_id: answer.custom_field_id,
  question: answer.name,
  answer: answer.value,
})

const formatCustomField = (custom_field: any) => ({
  id: custom_field.id,
  name: custom_field.name,
  type: custom_field.type,
  options: custom_field.options
    .split(';')
    .map((option: string) => option.trim()),
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
    .where('custom_fields.calendar_event_id', '=', eventId)

  return fields.map(formatCustomField)
}

export async function getRegistrationsForCalendarEventId(
  eventId: number
): Promise<Array<Registration>> {
  const registrations = await db
    .select('registrations.*', 'users.id as user_id')
    .from('registrations')
    .leftJoin('users', 'users.id', '=', 'registrations.user_id')
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
      'custom_field_answers.custom_field_id'
    )
    .where(
      'custom_field_answers.registration_id',
      'IN',
      registrations.map(r => r.id)
    )

  const answersByRegistrationId = new Map()

  answers.forEach(answer => {
    if (!answersByRegistrationId.has(answer.registration_id)) {
      answersByRegistrationId.set(answer.registration_id, [answer])
    } else {
      answersByRegistrationId.get(answer.registration_id).push(answer)
    }
  })

  return registrations.map(registration => {
    const answers = answersByRegistrationId.get(registration.id) ?? []

    return {
      id: registration.id,
      user_id: registration.user_id,
      created: registration.created,
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      answers: answers.map(formatRegistrationAnswer),
    }
  })
}

function parseQueryResult(row: any): CalendarEvent {
  const picked = pick(row, [
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
  ])

  let organizer: { name: string; url: string } | null = null

  if (row.organizer) {
    organizer = {
      name: row.organizer,
      url: row.organizer_url ?? null,
    }
  }

  return {
    ...picked,
    organizer,
  }
}

function parseUserEventsQueryResult(
  row: any
): CalendarEvent & { price: string } {
  return { ...parseQueryResult(row), price: row.price as string }
}
