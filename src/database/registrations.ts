import { Knex } from 'knex'
import { db } from './db'
import { CustomFieldAnswer, Registration, RegistrationRow } from './types'
import { addTranslations } from './utils'

export async function getUsersRegistrationForEvent(
  user_id: number,
  event_id: number,
  locale: string,
): Promise<Registration> {
  const query = db('registrations')
  const queryWithRegistrationData = selectRegistrationRows(query)

  queryWithRegistrationData
    .where('registrations.event_id', event_id)
    .where('registrations.user_id', user_id)

  const row = await queryWithRegistrationData.first<RegistrationRow>()

  const customFields = await getCustomFieldAnswer(row.registration_id, locale)

  const avecCustomFields = row.avec_registration_id
    ? await getCustomFieldAnswer(row.avec_registration_id, locale)
    : undefined

  return formatRegistration(row, customFields, avecCustomFields)
}

export async function getRegistrationsForCalendarEventId(
  eventId: number,
  locale: string,
): Promise<Registration[]> {
  const query = db('registrations')
  const queryWithRegistrationData = selectRegistrationRows(query)

  queryWithRegistrationData.where('registrations.calendar_event_id', eventId)

  const rows = await queryWithRegistrationData

  return Promise.all(
    rows.map(async row => {
      const customFields = await getCustomFieldAnswer(row.id, locale)

      const avecCustomFields = row.avec_registration_id
        ? await getCustomFieldAnswer(row.avec_registration_id, locale)
        : undefined

      return formatRegistration(row, customFields, avecCustomFields)
    }),
  )
}

function selectRegistrationRows(query: Knex.QueryBuilder) {
  query.select(
    'registrations.id',
    'registrations.user_id',
    'registrations.created',
    'registrations.name',
    'registrations.email',
    'registrations.phone',
  )

  query.leftJoin('registrations as avec_registrations', function () {
    this.on(
      'avec_registrations.id',
      '=',
      'registrations.avec_registration_id',
    ).andOnNotNull('registrations.avec_registration_id')
  })

  query.select(
    'avec_registrations.registration_id as avec_registration_id',
    'avec_registrations.name as avec_name',
    'avec_registrations.email as avec_email',
    'avec_registrations.phone as avec_phone',
  )

  return query
}

async function getCustomFieldAnswer(
  registration_id: number,
  locale: string,
): Promise<CustomFieldAnswer[]> {
  const query = db('custom_fields_answers')

  query.select(
    'custom_fields_answers.custom_field_id',
    'custom_fields_answers.value',
  )

  addTranslations(query, 'custom_fields', locale, ['name'])

  query.where('custom_fields_answers.registration_id', registration_id)

  return query.then(rows => rows.map(formatRegistrationAnswer))
}

function formatRegistration(
  row: RegistrationRow,
  customFieldAnswers: CustomFieldAnswer[],
  avecCustomFields?: CustomFieldAnswer[],
): Registration {
  return {
    user_id: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    customFieldAnswers: customFieldAnswers,
    avecRegistration: row.avec_registration_id
      ? {
          name: row.avec_name,
          email: row.avec_email,
          phone: row.avec_phone,
          customFieldAnswers: avecCustomFields,
        }
      : undefined,
  }
}

export function formatRegistrationAnswer(row: any): CustomFieldAnswer {
  return {
    id: row.custom_field_id,
    question: row.name,
    answer: row.value,
  }
}
