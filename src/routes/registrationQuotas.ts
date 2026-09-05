import express from 'express'
import * as registrationQuotas from '../database/registrationQuotas'
import { localeSchema } from './validators'

const router = express.Router()

router.get('/:eventId', async (req, res) => {
  try {
    const result = localeSchema.safeParse(req.query)

    if (!result.success) {
      return res.status(400).json({ error: 'Bad request' })
    }

    const quotas = await registrationQuotas.getEventsRegistrationQuotas(
      Number(req.params.eventId),
      result.data.locale,
    )

    return res.json(quotas)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'internal server error' })
  }
})

export default router
