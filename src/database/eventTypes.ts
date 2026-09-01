import { db } from './db'
import { EventType, EventTypeRow, EventTypeTranslation, IdRow } from './types'

export async function getAllEventTypes(): Promise<EventType[]> {
  const query = db('event_types')

  query.select('event_types.id', 'event_types.implicit_alcohol_meter')

  query.where('event_types.deleted', false)

  const rows: EventTypeRow[] = await query

  return Promise.all(
    rows.map(async row => ({
      id: row.id,
      implicit_alcohol_meter: row.implicit_alcohol_meter,
      translations: await getEventTypeTranslations(row.id),
    })),
  )
}

export const isExistingEventType = async (id: number): Promise<boolean> => {
  const result = await db('event_types').where({ id }).select(1).first()
  return !!result
}

/**
 * @returns event type id
 */
export async function insertEventType(eventType: EventType): Promise<number> {
  const query = db('event_types')

  const row: IdRow = await query.insert(
    {
      implicit_alcohol_meter: eventType.implicit_alcohol_meter,
    },
    'id',
  )

  await Promise.all(
    eventType.translations.map(translation => {
      insertEventTypeTranslationIfNotExits(row.id, translation)
    }),
  )

  return row.id
}

export async function insertEventTypeTranslationIfNotExits(
  event_type_id: number,
  translation: EventTypeTranslation,
) {
  const query = db('events_translations')

  query.insert({
    event_type_id: event_type_id,
    locale: translation.locale,
    event_type: translation.event_type,
  })

  query.onConflict(['event_type_id', 'locale']).ignore()

  await query
}

async function getEventTypeTranslations(
  event_type_id: number,
): Promise<EventTypeTranslation[]> {
  const query = db('events_translations')

  query.select<EventTypeTranslation[]>(
    'events_translations.locale',
    'events_translations.event_type',
  )

  query.where('events_translations.event_id', event_type_id)

  return query
}
