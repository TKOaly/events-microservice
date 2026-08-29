import moment from 'moment'
import { addTranslations, addEventCategory, addLocation } from './utils'
import { db } from './db'
import { Event, ListEvent } from './types'
import { Knex } from 'knex'

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

export function selectEventColumns(query: Knex.QueryBuilder) {
  query.select(
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

  return query
}
