import { insertCustomField } from './customFields'
import { db } from './db'
import {
  IdRow,
  RegistrationQuota,
  RegistrationQuotaInsertionData,
  RegistrationQuotaTranslation,
} from './types'

export async function insertRegistrationQuota(
  quota: RegistrationQuotaInsertionData,
  eventId: number,
) {
  const query = db('registration_quotas')

  const row: IdRow = await query.insert(
    {
      event_id: eventId,
      max_participants: quota.max_participants,
      membership_required: quota.membership_required,
      outsiders_allowed: quota.outsiders_allowed,
      avec_can_attend: quota.avec_can_attend,
      registration_starts: quota.registration_starts,
      registration_ends: quota.registration_ends,
      cancellation_starts: quota.cancellation_starts,
      cancellation_ends: quota.cancellation_ends,
    },
    'id',
  )

  await Promise.all(
    quota.translations.map(translation => {
      insertRegistrationQuotaTranslationIfNotExits(row.id, translation)
    }),
  )

  await Promise.all(
    quota.fields.map(field => {
      insertCustomField(field, row.id)
    }),
  )
}

export async function insertRegistrationQuotaTranslationIfNotExits(
  registration_quota_id: number,
  translation: RegistrationQuotaTranslation,
) {
  const query = db('registration_quotas_translation')

  query.insert({
    custom_field_id: registration_quota_id,
    locale: translation.locale,
    quota_name: translation.quota_name,
  })

  query.onConflict(['registration_quota_id', 'locale']).ignore()

  await query
}
