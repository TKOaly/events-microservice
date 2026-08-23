import { db } from './db'
import { selectEventColumns } from './events'
import {
  Event,
  EventTemplate,
  EventTemplateTitle,
  EventTranslation,
  Translation,
} from './types'
import { addTranslations } from './utils'

export async function getEventTemplateName(locale: string) {
  let query = db('events')

  query = addTranslations(query, 'events', locale, ['title'])
  query.select<EventTemplateTitle>('events.id')

  return query
}

export async function getEventTemplate(id: number): Promise<EventTemplate> {
  const query = db('events')

  const queryWithEventSelected = selectEventColumns(query, false)

  queryWithEventSelected
    .where('events.deleted', false)
    .where('events.template', true)
    .where('events.id', id)

  const event = await queryWithEventSelected.first<Event>()

  const [eventTranslations, customFieldTemplates] = await Promise.all([
    getEventTranslations(event.id),
    getCustomFieldTemplates(event.id),
  ])

  return {
    starts: event.starts,
    registration_starts: event.registration_starts,
    registration_ends: event.registration_ends,
    cancellation_starts: event.cancellation_starts,
    cancellation_ends: event.cancellation_ends,
    alcohol_meter: event.alcohol_meter,
    price: event.price,
    membership_required: event.membership_required,
    outsiders_allowed: event.outsiders_allowed,
    responsible: event.responsible,
    show_responsible: event.show_responsible,
    avec: event.avec,
    eventTranslations: eventTranslations,
    customFieldTemplates: customFieldTemplates,
  }
}

export async function deleteEventTemplate(id: number) {
  db('events').where('events.id', id).update({ template: false })
}

async function getEventTranslations(
  event_id: number,
): Promise<EventTranslation[]> {
  const query = db('event_translations')

  query.select<EventTranslation[]>(
    'event_translations.locale',
    'event_translations.title',
    'event_translations.description',
  )

  query.where('event_translations.event_id', event_id)

  return query
}

async function getCustomFieldTemplates(event_id: number) {
  const query = db('custom_fields')

  query.select(
    'custom_fields.id',
    'custom_fields.type',
    'custom_fields.options',
    'custom_fields.required',
  )

  query.where('custom_fields.event_id', event_id)
  const rows = await query

  return Promise.all(
    rows.map(async row => {
      const translation = await db('custom_fields_translations')
        .select(
          'custom_fields_translations.locale',
          'custom_fields_translations.name',
        )
        .where('custom_fields_translations.id', row.id)
        .first<Translation[]>()

      return {
        registration_quota_id: row.registration_quota_id,
        type: row.type,
        options: row.options,
        required: row.required,
        translations: translation,
      }
    }),
  )
}
