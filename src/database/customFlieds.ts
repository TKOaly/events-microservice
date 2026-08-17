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

  return rows.map(formatCustomField)
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

  return rows.map(formatCustomField)
}

function formatCustomField(row: any) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    options: row.options.split(';').map((option: string) => option.trim()),
    required: row.required,
  }
}

export function formatRegistrationAnswer(row: DbAnswer) {
  return {
    question_id: row.custom_field_id,
    question: row.name,
    answer: row.value,
  }
}
