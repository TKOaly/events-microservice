import express from 'express'
import * as events from '../database/events'
import { localeSchema } from './validators'

const router = express.Router()

router.get('/:userId/events', async (req, res) => {
  try {
    const result = localeSchema.safeParse(req.query)

    if (!result.success) {
      return res.status(400).json({ error: 'Bad request' })
    }

    const calendarEvents = await events.getEventsForUserId(
      Number(req.params.userId),
      result.data.locale
    )

    return res.json(calendarEvents)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'internal server error' })
  }
})

export default router