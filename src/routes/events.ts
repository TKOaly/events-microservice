import express from 'express'
import * as events from '../database/events'
import { eventRequestingSchema } from './validators'

const router = express.Router()

router.get('/eventList', async (req, res) => {
  try {
    const result = eventRequestingSchema.safeParse(req.query)

    if (!result.success) {
      return res.status(400).json({ error: 'Bad request' })
    }

    const calendarEvents = await events.getAllCalendarEventsForEventList(
      result.data.locale,
      result.data.fromDate?.toISOString()
    )

    return res.status(200).json(calendarEvents)
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: 'internal server error' })
  }
})

router.get('/:eventId', async (req, res) => {
  try {
    const result = eventRequestingSchema.safeParse(req.query)
    const id = parseInt(req.params.eventId)


    if (!result.success) {
      return res.status(400).json({ error: 'Bad request' })
    }

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Bad request' })
    }

    const event = await events.getEventById(id, result.data.locale)

    if (!event) {
      return res.status(404).json({ error: 'Not Found' })
    }

    return res.json(event)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'internal server error' })
  }
})

export default router
