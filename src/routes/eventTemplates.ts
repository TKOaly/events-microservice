import express from 'express'
import * as eventTemplates from '../database/eventTemplates'

const router = express.Router()

router.get('/:eventId', async (req, res) => {
  try {
    const templates = await eventTemplates.getEventTemplate(
      Number(req.params.eventId),
    )

    return res.json(templates)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'internal server error' })
  }
})

export default router