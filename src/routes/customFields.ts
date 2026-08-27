import express from 'express'
import * as customFields from '../database/customFields'
import { localeSchema } from './validators'

const router = express.Router()

router.get('/:eventId/fields', async (req, res) => {
  try {
    const result = localeSchema.safeParse(req.query)

    if (!result.success) {
      return res.status(400).json({ error: 'Bad request' })
    }

    const fields = await customFields.getAllCustomFieldsForCalendarEventId(
      Number(req.params.eventId),
      result.data.locale,
    )

    return res.json(fields)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'internal server error' })
  }
})

router.get('/:eventId/fields/:quotaId', async (req, res) => {
  try {
    const result = localeSchema.safeParse(req.query)

    if (!result.success) {
      return res.status(400).json({ error: 'Bad request' })
    }

    const fields =
      await customFields.getCustomFieldsForCalendarEventIdAndRegistrationQuotaId(
        Number(req.params.eventId),
        Number(req.params.quotaId),
        result.data.locale,
      )

    return res.json(fields)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'internal server error' })
  }
})

export default router
