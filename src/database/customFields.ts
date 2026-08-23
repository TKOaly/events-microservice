import { db } from './db'
import { CustomField } from './types'
import { addTranslations } from './utils'

export async function getAllCustomFieldsForCalendarEventId(
  eventId: number,
  locale: string,
): Promise<CustomField[]> {
  const query = db('custom_fields')

  const queryWithTranslations = addTranslations(
    query,
    'custom_fields',
    locale,
    ['name'],
  )

  queryWithTranslations.where('custom_fields.event_id', eventId)

  let rows = await queryWithTranslations.select(
    'custom_fields.id',
    'custom_fields.type',
    'custom_fields.options',
    'custom_fields.required',
  )

  return rows
}

export async function getCustomFieldsForCalendarEventIdAndRegistrationQuotaId(
  eventId: number,
  registrationQuotaId: number,
  locale: string,
): Promise<CustomField[]> {
  const query = db('custom_fields')

  const queryWithTranslations = addTranslations(
    query,
    'custom_fields',
    locale,
    ['name'],
  )

  queryWithTranslations
    .where('custom_fields.event_id', eventId)
    .whereIn('custom_fields.registration_quota_id', [registrationQuotaId, null])

  let rows = await queryWithTranslations.select(
    'custom_fields.id',
    'custom_fields.type',
    'custom_fields.options',
    'custom_fields.required',
  )

  return rows
}
