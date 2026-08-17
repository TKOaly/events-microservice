import { db } from './db'
import { selectEventColumns } from './events'
import { EventTemplate, EventTemplateTitle } from './types'
import { addTranslations } from './utils'

export async function getEventTemplateName(locale: string) {
  let query = db('events')

  query = addTranslations(query, 'events', locale, ['title'])
  query.select<EventTemplateTitle>('events.id')

  return query
}

export async function getEventTemplate(id: number): Promise<EventTemplate> {
  let query = db('events')

  query = selectEventColumns(query, false)

  query.where('events.deleted', false).where('events.template', true)

  query.leftJoin('custom_fields', 'custom_fields.event_id', 'events.id')

  query.select('custom_fields.')

  query.orderBy('events.title', 'asc')

  return query.then(r => r.map(parseTemplateQueryResult))
}

function formatEventTemplate(rows: any): EventTemplate {}
