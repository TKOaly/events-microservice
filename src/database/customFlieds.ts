import { db } from './db';
import { CustomField, DbAnswer } from './types';


export async function getCustomFieldsForCalendarEventId(
  eventId: number
): Promise<CustomField[]> {
  const fields = await db
    .select<CustomField[]>('custom_fields.')
    .from('custom_fields')
    .where('custom_fields.calendar_event_id', '=', eventId)

    return fields.map(formatCustomField)
}

export function formatCustomField(row: any) {
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
