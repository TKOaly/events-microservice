import { db } from './db'
import { EventType, EventTypeRow, EventTypeTranslation } from './types'

export async function getAllEventTypes(): Promise<EventType[]> {
  const query = db('event_types')

  query.select('event_types.id', 'event_types.implicit_alcohol_meter')
  
  query.where('event_types.deleted', false)

  const rows: EventTypeRow[] = await query

  return Promise.all(
    rows.map(async row => ({
      id: row.id,
      implicit_alcohol_meter: row.implicit_alcohol_meter,
      eventTypeTranslations: await getEventTypeTranslations(row.id),
    })),
  )
}

async function getEventTypeTranslations(
  event_type_id: number,
): Promise<EventTypeTranslation[]> {
  const query = db('event_translations')

  query.select<EventTypeTranslation[]>(
    'event_translations.locale',
    'event_translations.event_type',
  )

  query.where('event_translations.event_id', event_type_id)

  return query
}
