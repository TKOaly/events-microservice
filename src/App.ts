import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import * as calendarEventService from './services/calendarEventService'
import morgan from 'morgan'
import * as z from 'zod'

async function startServer(servicePort: number) {
  const logger = morgan(':method :url :status - :response-time ms')
  const app = express()

  app.use(logger)

  // Ping route
  app.get('/ping', (_, res) => res.send('Hello there'))

  const authorizeRequest: express.Handler = (
    req,
    res,
    next
  ) => {
    if (req.get('X-Token') === process.env.SERVICE_AUTH_TOKEN) {
      return next()
    }
    return res.status(401).json({ error: 'unauthorized' })
  }

  app.get(
    '/api/events',
    async (req, res) => {
    const fromDate = req.query.fromDate
    try {
      const calendarEvents = await calendarEventService.getAllCalendarEvents(
          fromDate?.toString()
      )
      return res.status(200).json(calendarEvents)
    } catch (e) {
      console.log(e)
      res.status(500).json({ error: 'internal server error' })
    }
    }
  )

  app.get(
    '/api/users/:id/events',
    authorizeRequest,
    async (req, res) => {
    try {
      const calendarEvents = await calendarEventService.getEventsForUserId(
          Number(req.params.id)
      )
      return res.json(calendarEvents)
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'internal server error' })
    }
  })

  app.get('/api/events/templates', authorizeRequest, async (req, res) => {
    try {
      const templates = await calendarEventService.getTemplateEvents()
      return res.json(templates)
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'internal server error' })
    }
  })

  app.get('/api/events/:id', authorizeRequest, async (req, res) => {
    try {
      const id = parseInt(req.params.id)
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid ID' })
      const event = await calendarEventService.getEventById(id)
      if (!event) return res.status(404).json({ error: 'Not Found' })
      return res.json(event)
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'internal server error' })
    }
  })

  app.get(
    '/api/events/:id/registrations',
    authorizeRequest,
    async (req, res) => {
      try {
        const registrations = await calendarEventService.getRegistrationsForCalendarEventId(Number(req.params.id))

        return res.json(registrations)
      } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'internal server error' })
      }
    },
  )

  app.get(
    '/api/eventlist',
    async (req, res) => {
    const fromDate = req.query.fromDate
    try {
      const calendarEvents = await calendarEventService.getAllCalendarEventsForEventList(
          fromDate?.toString()
      )
      return res.status(200).json(calendarEvents)
    } catch (e) {
      console.log(e)
      res.status(500).json({ error: 'internal server error' })
    }
    }
  )

  app.get(
    '/api/events/:id/fields',
    authorizeRequest,
    async (req, res) => {
    try {
        const fields = await calendarEventService.getCustomFieldsForCalendarEventId(Number(req.params.id))

      return res.json(fields)
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'internal server error' })
    }
    },
  )

  app.post(
    '/api/events',
    express.json(),
    authorizeRequest,
    async (req, res) => {
        const event = calendarEventService.EventSchema.safeParse(req.body);
      if (!event.success) {
          const err = z.prettifyError(event.error);
          return res.status(400).send(err);
      } else {
        try {
          const result = await calendarEventService.addNewEvent(event.data)
          return res.status(201).json({ id: result })
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'internal server error' });
          };
        }
      }
  );

  app.put(
    '/api/events/:id',
    express.json(),
    authorizeRequest,
    async (req, res) => {
      const event = calendarEventService.EventSchema.safeParse(req.body);
      if (!event.success) {
        const err = z.prettifyError(event.error);
        return res.status(400).send(err);
      } else {
        try {
          const id = parseInt(req.params.id)
          if (Number.isNaN(id)) {
            return res.status(404).json({ error: "Not Found" })
          } else if (!await calendarEventService.isExistingEvent(id)) {
            return res.status(404).json({ error: "ID Not Found" })
          }
          const result = await calendarEventService.updateEvent(id, event.data)
          return res.status(200).json({ id: result })
        } catch (e) {
          console.error(e)
          return res.status(500).json({ error: "internal server error" })
        }
      }
    }
  )

  app.listen(servicePort, () =>
    console.log('App listining on port', servicePort)
  )
}

startServer(Number(process.env.SERVICE_PORT || 3001))
