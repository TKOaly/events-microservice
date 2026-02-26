import { z } from 'zod'

const nullableDate = z.coerce.date().nullable().optional()
const nullableString = z.string().nullable().optional()
const nullableBoolean = z.boolean().nullable().optional()
const nullableNumber = z.number().nullable().optional()

export const newCalendarEventSchema = z.object({
  name: z.string(),
  starts: z.coerce.date(),
  template: z.boolean(),
  deleted: z.boolean(),
  user_id: nullableNumber,
  created: nullableDate,
  registration_starts: nullableDate,
  registration_ends: nullableDate,
  cancellation_starts: nullableDate,
  cancellation_ends: nullableDate,
  location: nullableString,
  category: nullableString,
  description: nullableString,
  price: nullableString,
  map: nullableString,
  membership_required: nullableBoolean,
  outsiders_allowed: nullableBoolean,
  responsible: nullableString,
  show_responsible: nullableBoolean,
  avec: nullableBoolean,
  alcohol_meter: nullableNumber,
})

export type NewCalendarEventInput = z.infer<typeof newCalendarEventSchema>
