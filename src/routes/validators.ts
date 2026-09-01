import { nonoptional, z } from 'zod'

export const localeSchema = z.object({
  locale: z.string().min(1, 'locale is required'),
})

export const eventRequestingSchema = localeSchema.extend({
  fromDate: z.date().optional(),
})

export const eventTranslationSchema = localeSchema.extend({
  title: z.string(),
  description: z.string(),
})

export const locationTranslationSchema = localeSchema.extend({
  location: z.string(),
})

export const eventTypeTranslationSchema = localeSchema.extend({
  event_type: z.string(),
})

export const customFieldTranslationSchema = localeSchema.extend({
  name: z.string(),
})

export const registrationQuotaTranslationSchema = localeSchema.extend({
  quota_name: z.string(),
})

export const locationSchema = z.object({
  map_link: z.string().optional(),
  translations: z.array(locationTranslationSchema).nonoptional(),
})

export const eventTypeSchema = z.object({
  implicit_alcohol_meter: z.number().optional(),
  translations: z.array(eventTypeTranslationSchema).nonoptional(),
})

export const customFieldSchema = z.object({
  type: z.enum(['textarea', 'radio', 'checkbox', 'text']).nonoptional(),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
  translations: z.array(customFieldTranslationSchema).nonoptional(),
})

export const registrationQuotaSchema = z.object({
  max_participants: z.number().nonoptional(),
  membership_required: z.boolean().optional(),
  outsiders_allowed: z.boolean().optional(),
  avec_can_attend: z.boolean().optional(),
  registration_starts: z.date().nonoptional(),
  registration_ends: z.date().nonoptional(),
  cancellation_starts: z.date().optional(),
  cancellation_ends: z.date().optional(),
  fields: z.array(customFieldSchema),
  translations: z.array(registrationQuotaTranslationSchema),
})

export const eventAddingSchema = z.object({
  user_id: z.number().nonoptional(),
  starts: z.date().nonoptional(),
  alcohol_meter: z.number().optional(),
  price: z.string().optional(),
  responsible: z.string().optional(),
  show_responsible: z.boolean().default(false),
  weekly_event: z.boolean().default(false),
  weekly_event_end_time: z.date().optional(),
  template: z.boolean().default(false),
  translations: z.array(eventTranslationSchema),
  location: locationSchema.nonoptional(),
  eventType: eventTypeSchema.nonoptional(),
  fields: z.array(customFieldSchema).nonoptional(),
  registrationQuotas: z.array(registrationQuotaSchema).nonoptional(),
})
