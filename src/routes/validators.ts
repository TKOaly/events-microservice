import { z } from 'zod'

export const localeSchema = z.object({
  locale: z.string().min(1, 'locale is required'),
})

export const eventRequestingSchema = localeSchema.extend({
    fromDate: z.date().nullable()
})
