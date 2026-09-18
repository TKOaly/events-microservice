# Events microservice

## Setting up dev environment

1.  `yarn install`
2.  Copy `.env.example` and rename it to `.env`
3.  Fill in your env vars
4.  `yarn start-dev`

## API routes

### `/ping`
### GET
Health check endpoint for the microservice.

### `/api/events`
### GET
List all events.

### POST
Create event.

### `/api/events/templates`
### GET
get event templates

### `/api/events/{id}`
### GET
Get event with id

### PUT
Update event with id

### `/api/events/{id}/registrations`
### GET
Get event registrations

### `/api/events/{id}/fields`
### GET
Get event registrations custom fields

### `/api/users/{id}/events`
### GET
Get users all registrations

### `/api/events/list`
### GET
Get subset of event data for websites calender/event list functionally

## License

MIT license
