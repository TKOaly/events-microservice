import dotenv from 'dotenv'
import express from 'express'
import { authorizeRequest } from './routes/authMiddleware'
import { logger } from './logger'

import events from './routes/events'
import eventTemplates from './routes/eventTemplates'
import customFields from './routes/customFields'
import registrationQuotas from './routes/registrationQuotas'
import users from './routes/users'
import registration from './routes/registration'

dotenv.config()

const app = express()

app.use(logger)

app.get('/api/ping', (_, res) => res.send('Hello there'))

app.use(authorizeRequest)

app.use('/api/events', events)
app.use('/api/eventTemplate', eventTemplates)
app.use('/api/fields', customFields)
app.use('/api/quotas', registrationQuotas)
app.use('/api/user', users)
app.use('/api/registration', registration)

export default app
