import moment from 'moment'
import { addTranslations, addEventCategory, addLocation } from './utils'
import { db } from './db'
import {
  Event,
  EventInsertionData,
  EventTranslation,
  IdRow,
  ListEvent,
} from './types'
import { Knex } from 'knex'
import {
  insertEventType,
  insertEventTypeTranslationIfNotExits,
  isExistingEventType,
} from './eventTypes'
import {
  insertLocation,
  insertLocationTranslationIfNotExits,
  isExistingLocation,
} from './locations'
import { insertCustomField } from './customFields'
import { insertRegistrationQuota } from './registrationQuotas'

export async function getAllCalendarEvents(
  locale: string,
  fromDate?: string,
): Promise<Event[]> {
  let query = db('events')

  query = selectEventColumns(query)
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

export async function getEventById(id: number, locale: string): Promise<Event> {
  let query = db('events')

  query = selectEventColumns(query)
  query = addTranslations(query, 'events', locale, ['title', 'description'])
  query = addEventCategory(query, 'events', locale, { category: true })
  query = addLocation(query, 'events', locale, {
    location: true,
    map_link: true,
  })

  query.where({ id }).where('deleted', false)

  return query.first()
}

export async function getEventsForUserId(
  userId: number,
  locale: string,
): Promise<Event[]> {
  let query = db('registration')
    .innerJoin('events', 'events.id', '=', 'registrations.calendar_event_id')
    .where({ 'registrations.user_id': userId })

  query = selectEventColumns(query)
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

export async function isExistingEvent(id: number): Promise<boolean> {
  const result = await db('events').where({ id }).select(1).first()
  return !!result
}

export async function insertEvent(event: EventInsertionData): Promise<number> {
  const eventTypeId = event.eventType.id
  let insertedEventTypeId: number

  if (!eventTypeId) {
    insertedEventTypeId = await insertEventType(event.eventType)
  } else {
    await Promise.all(
      event.eventType.translations.map(translation => {
        insertEventTypeTranslationIfNotExits(eventTypeId, translation)
      }),
    )
    insertedEventTypeId = eventTypeId
  }

  const locationId = event.location.id
  let insertedLocationId: number

  if (!locationId) {
    insertedLocationId = await insertLocation(event.location)
  } else {
    await Promise.all(
      event.location.translations.map(translation => {
        insertLocationTranslationIfNotExits(locationId, translation)
      }),
    )
    insertedLocationId = locationId
  }

  const row: IdRow = await db('events').insert(
    {
      user_id: event.user_id,
      starts: event.starts,
      alcohol_meter: event.alcohol_meter,
      location_id: insertedLocationId,
      type_id: insertedEventTypeId,
      price: event.price,
      responsible: event.responsible,
      show_responsible: event.show_responsible,
      weekly_event: event.weekly_event,
      weekly_event_end_time: event.weekly_event,
      template: event.template,
    },
    'id',
  )

  await Promise.all(
    event.translations.map(translation => {
      insertEventTranslationIfNotExits(row.id, translation)
    }),
  )

  await Promise.all(
    event.fields.map(field => {
      insertCustomField(field)
    }),
  )

  await Promise.all(
    event.registrationQuotas.map(quota => {
      insertRegistrationQuota(quota, row.id)
    }),
  )

  return row.id
}

export const updateEvent = async (
  id: number,
  event: Event,
): Promise<number> => {
  await db('events').where('id', id).update(event)
  return id
}

export function selectEventColumns(query: Knex.QueryBuilder) {
  query.select(
    'events.id',
    'events.user_id',
    'events.created',
    'events.starts',
    'events.alcohol_meter',
    'events.price',
    'events.responsible',
    'events.show_responsible',
    'events.weekly_event',
    'events.weekly_event_end_time',
  )

  return query
}

async function insertEventTranslationIfNotExits(
  event_id: number,
  translation: EventTranslation,
) {
  const query = db('events_translations')

  query.insert({
    location_id: event_id,
    locale: translation.locale,
    title: translation.title,
    description: translation.description,
  })

  query.onConflict(['event_id', 'locale']).ignore()

  await query
}
