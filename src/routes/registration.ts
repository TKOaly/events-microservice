import express from 'express'
import * as registration from '../database/registrations'
import { localeSchema } from './validators'

const router = express.Router()

router.get('/:eventId', async (req, res) => {
  try {
    const result = localeSchema.safeParse(req.query)

    if (!result.success) {
      return res.status(400).json({ error: 'Bad request' })
    }

    const registrations = await registration.getAllRegistrationsForEvent(
      Number(req.params.eventId),
      result.data.locale,
    )

    return res.json(registrations)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'internal server error' })
  }
})

export default router
