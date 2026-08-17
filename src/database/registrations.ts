import { db } from './db';
import { Registration } from './types';
import { formatRegistrationAnswer } from './customFlieds';


export async function getRegistrationsForCalendarEventId(
  eventId: number
): Promise<Array<Registration>> {
  const registrations = await db
    .select('registrations.*', 'users.id as user_id')
    .from('registrations')
    .leftJoin('users', 'users.id', '=', 'registrations.user_id')
    .where('registrations.calendar_event_id', eventId);

  const answers = await db
    .select(
      'custom_field_answers.value',
      'custom_field_answers.registration_id',
      'custom_fields.name',
      'custom_fields.id as custom_field_id'
    )
    .from('custom_field_answers')
    .join(
      'custom_fields',
      'custom_fields.id',
      '=',
      'custom_field_answers.custom_field_id'
    )
    .where(
      'custom_field_answers.registration_id',
      'IN',
      registrations.map(r => r.id)
    );

  const answersByRegistrationId = new Map();

  answers.forEach(answer => {
    if (!answersByRegistrationId.has(answer.registration_id)) {
      answersByRegistrationId.set(answer.registration_id, [answer]);
    } else {
      answersByRegistrationId.get(answer.registration_id).push(answer);
    }
  });

  return registrations.map(registration => {
    const answers = answersByRegistrationId.get(registration.id) ?? [];

    return {
      id: registration.id,
      user_id: registration.user_id,
      created: registration.created,
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      answers: answers.map(formatRegistrationAnswer),
    };
  });
}
