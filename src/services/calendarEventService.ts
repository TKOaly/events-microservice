import { knex, Knex } from 'knex'
import config from '../../knexfile'
import { pick } from 'remeda'
import moment from 'moment'

export interface Event {
  id: number
  name?: string
  user_id?: number
  created?: Date
  starts?: Date
  registration_starts?: Date
  registration_ends?: Date
  cancellation_starts?: Date
  cancellation_ends?: Date
  alcohol_meter?: number
  location?: string
  category?: string
  price?: string
  map_link?: string
  membership_required?: boolean
  outsiders_allowed?: boolean
  responsible?: string
  show_responsible?: boolean
  avec?: boolean
}

const db = knex(config.production)

export async function getAllCalendarEvents(
  locale: string,
  fromDate?: string,
): Promise<Event[]> {
  let query = db('events')

  query = selectEventColumns(query, true)
  query = addTranslations(query, 'events', locale, [
    'title as name',
    'description',
  ])
  query = addEventCategory(query, 'events', locale, { category: true })
  query = addLocation(query, 'events', locale, {
    location: true,
    map_link: true,
  })

  // Sort by start date
  query.orderBy('starts', 'asc')

  // Delete deleted events and templates
  query.where('deleted', false).where('template', false)

  if (fromDate) {
    query.where(
      'starts',
      '>=',
      moment(new Date(fromDate)).format('YYYY.MM.DD HH:mm'),
    )
  }

  return query
}

export type ListEvent = Pick<
  Event,
  | 'id'
  | 'name'
  | 'location'
  | 'starts'
  | 'registration_starts'
  | 'registration_ends'
>

export async function getAllCalendarEventsForEventList(
  locale: string,
  fromDate?: string,
): Promise<ListEvent[]> {
  let query = db('events').select<ListEvent[]>(
    'events.id',
    'events.starts',
    'events.registration_starts',
    'events.registration_ends',
  )

  query = addTranslations(query, 'events', locale, ['title as name'])
  query = addLocation(query, 'events', locale, { location: true })

  // Sort by start date
  query.orderBy('starts', 'asc')

  // Delete deleted events and templates
  query.where('deleted', false).where('template', false)

  if (fromDate) {
    query.where(
      'starts',
      '>=',
      moment(new Date(fromDate)).format('YYYY.MM.DD HH:mm'),
    )
  }

  return query
}

export interface TemplateEventFull {
  id: number
  name: string
  starts: Date | null
  registration_starts: Date | null
  registration_ends: Date | null
  cancellation_starts: Date | null
  cancellation_ends: Date | null
  location: string | null
  category: string | null
  description: string | null
  alcohol_meter: number | null
  price: string | null
  map: string | null
  max_participants: number | null
  membership_required: boolean | null
  outsiders_allowed: boolean | null
  responsible: string | null
  show_responsible: boolean | null
  avec: boolean | null
}

function parseTemplateQueryResult(row: any): TemplateEventFull {
  return {
    id: row.id,
    name: row.name,
    starts: row.starts ?? null,
    registration_starts: row.registration_starts ?? null,
    registration_ends: row.registration_ends ?? null,
    cancellation_starts: row.cancellation_starts ?? null,
    cancellation_ends: row.cancellation_ends ?? null,
    location: row.location ?? null,
    category: row.category ?? null,
    description: row.description ?? null,
    alcohol_meter: row.alcohol_meter ?? null,
    price: row.price ?? null,
    map: row.map ?? null,
    max_participants: row.max_participants ?? null,
    membership_required: row.membership_required ?? null,
    outsiders_allowed: row.outsiders_allowed ?? null,
    responsible: row.responsible ?? null,
    show_responsible: row.show_responsible ?? null,
    avec: row.avec ?? null,
  }
}

export async function getTemplateEvents(): Promise<TemplateEventFull[]> {
  return db('events')
    .select()
    .where('deleted', '0')
    .where('template', '1')
    .orderBy('name', 'asc')
    .then(r => r.map(parseTemplateQueryResult))
}

export async function getEventById(id: number, locale: string): Promise<Event> {
  let query = db('events')

  query = selectEventColumns(query, false)
  query = addTranslations(query, 'events', locale, [
    'title as name',
    'description',
  ])
  query = addEventCategory(query, 'events', locale, { category: true })
  query = addLocation(query, 'events', locale, {
    location: true,
    map_link: true,
  })

  query.where({ id }).where('deleted', false)

  return query.first()
}

export const isExistingEvent = async (id: number): Promise<boolean> => {
  const res = await db('events').where({ id }).select(1).first()
  return !!res
}

export const addNewEvent = async (event: Event): Promise<number> => {
  return await db('events').insert(event, 'id')
}

export const updateEvent = async (
  id: number,
  event: Event,
): Promise<number> => {
  await db('events').where('id', id).update(event)
  return id
}

export async function getEventsForUserId(
  userId: number,
  locale: string,
): Promise<Event[]> {
  let query = db('registration')
    .innerJoin('events', 'events.id', '=', 'registrations.calendar_event_id')
    .where({ 'registrations.user_id': userId })

  query = selectEventColumns(query, true)
  query = addTranslations(query, 'events', locale, [
    'title as name',
    'description',
  ])
  query = addEventCategory(query, 'events', locale, { category: true })
  query = addLocation(query, 'events', locale, {
    location: true,
    map_link: true,
  })

  return query
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
  eventId: number,
): Promise<Array<CustomField>> {
  const fields = await db
    .select('custom_fields.*')
    .from('custom_fields')
    .where('custom_fields.calendar_event_id', '=', eventId)

  return fields.map(formatCustomField)
}

export async function getRegistrationsForCalendarEventId(
  eventId: number,
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
      'custom_fields.id as custom_field_id',
    )
    .from('custom_field_answers')
    .join(
      'custom_fields',
      'custom_fields.id',
      '=',
      'custom_field_answers.custom_field_id',
    )
    .where(
      'custom_field_answers.registration_id',
      'IN',
      registrations.map(r => r.id),
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

function addTableNameToColumn(tableName: string, column: string): string {
  const [realColumn, aliasPart] = column.split(/\s+as\s+/i).map(s => s.trim())
  return aliasPart
    ? `${tableName}.${realColumn} as ${aliasPart}`
    : `${tableName}.${realColumn}`
}

function addTranslations(
  query: Knex.QueryBuilder,
  tableName: string,
  locale: string,
  columns: string[],
) {
  const translationTable = `${tableName}_translation`
  const baseFkColumn = `${tableName.replace(/s$/, '')}_id`
  const knex = query.client

  const selectColumns = [
    `${tableName}.${baseFkColumn}`,
    `${translationTable}.locale`,
    ...columns.map(column => addTableNameToColumn(translationTable, column)),
  ]

  const translationSubquery =
    locale === 'fi'
      ? knex
          .queryBuilder()
          .select(selectColumns)
          .from(translationTable)
          .where('locale', 'fi')
      : knex
          .queryBuilder()
          .select(selectColumns)
          .from(translationTable)
          .whereIn('locale', [locale, 'fi'])
          .distinctOn(baseFkColumn)
          .orderBy([
            baseFkColumn,
            knex.raw('(locale = ?) desc', [locale]),
            'locale desc',
          ])

  query.leftJoin(translationSubquery.as(translationTable), function () {
    this.on(`${translationTable}.${baseFkColumn}`, '=', `${tableName}.id`)
  })

  return query
}

function addEventCategory(
  query: Knex.QueryBuilder,
  tableName: string,
  locale: string,
  columnsToSelect: { category?: boolean; implicit_alcohol_meter?: boolean },
) {
  const knex = query.client

  query.leftJoin(tableName, function () {
    this.on(`${tableName}.type_id`, '=', 'event_types.id').andOn(
      knex.raw('event_types.deleted = false'),
    )
  })

  if (columnsToSelect.category) {
    addTranslations(query, locale, 'event_types', ['name as category'])
  }

  if (columnsToSelect.implicit_alcohol_meter) {
    query.select('event_types.implicit_alcohol_meter')
  }

  return query
}

function addLocation(
  query: Knex.QueryBuilder,
  tableName: string,
  locale: string,
  columnsToSelect: { location?: boolean; map_link?: boolean },
) {
  const knex = query.client

  query.leftJoin(tableName, function () {
    this.on(`${tableName}.location_id`, '=', 'locations.id').andOn(
      knex.raw('locations.deleted = false'),
    )
  })

  if (columnsToSelect.location) {
    addTranslations(query, locale, 'locations', ['name as location'])
  }

  if (columnsToSelect.map_link) {
    query.select('event_type.map_link')
  }

  return query
}

function selectEventColumns(query: Knex.QueryBuilder, isArray: boolean) {
  if (isArray) {
    query.select<Event[]>(
      'events.id',
      'events.user_id',
      'events.created',
      'events.starts',
      'events.registration_starts',
      'events.registration_ends',
      'events.cancellation_starts',
      'events.cancellation_ends',
      'events.alcohol_meter',
      'events.location',
      'events.category',
      'events.price',
      'events.map_link',
      'events.membership_required',
      'events.outsiders_allowed',
      'events.responsible',
      'events.show_responsible',
      'events.avec',
    )
  } else {
    query.select<Event>(
      'events.id',
      'events.user_id',
      'events.created',
      'events.starts',
      'events.registration_starts',
      'events.registration_ends',
      'events.cancellation_starts',
      'events.cancellation_ends',
      'events.alcohol_meter',
      'events.location',
      'events.category',
      'events.price',
      'events.map_link',
      'events.membership_required',
      'events.outsiders_allowed',
      'events.responsible',
      'events.show_responsible',
      'events.avec',
    )
  }

  return query
}
