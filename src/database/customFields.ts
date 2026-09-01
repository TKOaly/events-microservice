import { db } from './db'
import {
  CustomField,
  CustomFieldInsertionData as CustomFieldInsertionData,
  CustomFieldTranslation,
  IdRow,
} from './types'
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

export async function insertCustomField(
  field: CustomFieldInsertionData,
  registration_quota_id?: number,
) {
  const query = db('custom_fields')

  const row: IdRow = await query.insert(
    {
      type: field.type,
      options: field.options,
      required: field.required,
      registration_quota_id: registration_quota_id,
    },
    'id',
  )

  await Promise.all(
    field.translations.map(translation => {
      insertCustomFieldTranslationIfNotExits(row.id, translation)
    }),
  )
}

export async function insertCustomFieldTranslationIfNotExits(
  custom_field_id: number,
  translation: CustomFieldTranslation,
) {
  const query = db('location_translations')

  query.insert({
    custom_field_id: custom_field_id,
    locale: translation.locale,
    name: translation.name,
  })

  query.onConflict(['custom_field_id', 'locale']).ignore()

  await query
}
