import knex from 'knex'
import { pick, map, prop } from 'remeda'
import moment from 'moment'
import { parse } from 'url'

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

export interface EventOrganizer {
  name: string
  url: string | null
}

const url = parse(process.env.DB_URL ?? '')
const [user, password] = url.auth?.split(':') ?? []


const db = knex({
  connection: {
    host: url.hostname ?? '',
    port: Number(url.port),
    user,
    password,
    database: url.path?.slice(1),
    typeCast: (field: any, next: () => void) => {
      if (field.type === 'DATETIME') {
        return field.string()?.replace(' ', 'T') ?? null
      }
      return next()
    },
  },
  client: 'mysql2',
})

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

type Answer = { question_id: number, question: string, answer: string }

type Registration = {
  user_id: number
  answers: Array<Answer>,
}

type DbAnswer = { custom_field_id: number, name: string, value: string }

const formatRegistrationAnswer = (answer: DbAnswer) => ({
  question_id: answer.custom_field_id,
  question: answer.name,
  answer: answer.value,
})

const formatCustomField = (custom_field: any) => ({
  id: custom_field.id,
  name: custom_field.name,
  type: custom_field.type,
  options: custom_field.options.split(';').map((option: string) => option.trim()),
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

  return fields.map(formatCustomField)
}

export async function getRegistrationsForCalendarEventId(
  eventId: number
): Promise<Array<Registration>> {
  const registrations = await db
    .select('registrations.*', 'users.id as user_id')
    .from('registrations')
    .leftJoin(
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
      answers: answers.map(formatRegistrationAnswer),
    }
  })
}

function parseQueryResult(row: any): CalendarEvent {
  const picked = pick(
    row,
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
  );

  let organizer: { name: string, url: string } | null = null;

  if (row.organizer) {
    organizer = {
      name: row.organizer,
      url: row.organizer_url ?? null,
    };
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

export async function createCalendarEvent(
  props: {
    name: string, // Looks weird on absence
    user_id: number | null,
    created: Date | null,
    starts: Date, // members.tko-aly.fi throws error on absence
    registration_starts: Date | null,
    registration_ends: Date | null, // If registration_starts is given but not _ends, members throws error
    cancellation_starts: Date | null,
    cancellation_ends: Date | null,
    location: string | null,
    category: string | null,
    description: string | null,
    price: string | null,
    map: string | null,
    membership_required: boolean | null,
    outsiders_allowed: boolean | null,
    template: boolean, // members.tko-aly.fi won't render on absence
    responsible: string | null,
    show_responsible: boolean | null,
    avec: boolean | null,
    deleted: boolean, // members.tko-aly.fi won't render on absence
    alcohol_meter: number | null,
  }
): Promise<knex.Knex.QueryBuilder<any, number[]>> {
  const calendarEvent = {
    name: props.name,
    user_id: props.user_id,
    created: props.created,
    starts: props.starts,
    registration_starts: props.registration_starts,
    registration_ends: props.registration_ends,
    cancellation_starts: props.cancellation_starts,
    cancellation_ends: props.cancellation_ends,
    location: props.location,
    category: props.category,
    description: props.description,
    price: props.price,
    map: props.map,
    membership_required: props.membership_required,
    outsiders_allowed: props.outsiders_allowed,
    template: props.template,
    responsible: props.responsible,
    show_responsible: props.show_responsible,
    avec: props.avec,
    deleted: props.deleted,
    alcohol_meter: props.alcohol_meter,
  }

  const query = db('calendar_events').insert(calendarEvent)

    return query
}
