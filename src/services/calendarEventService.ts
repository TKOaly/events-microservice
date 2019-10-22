import knex from "knex";
import R from "ramda";

export interface CalendarEvent {
  id: number;
  name: string;
  user_id: number;
  created: Date;
  starts: Date;
  registration_starts: Date;
  registration_ends: Date;
  cancellation_starts: Date;
  cancellation_ends: Date;
  location: string;
  category: string;
  description: string;
}

const db = knex({
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
  dialect: "mysql2"
});

export async function getAllCalendarEvents() {
  const query = await db().select().from<CalendarEvent>("calendar_events");
  return R.map(parseQueryResult, query);
}

function parseQueryResult(row: CalendarEvent) {
  return R.pick(
    [
      "id",
      "name",
      "user_id",
      "created",
      "starts",
      "registration_starts",
      "registration_ends",
      "cancellation_starts",
      "cancellation_ends",
      "location",
      "category",
      "description"
    ],
    row
  );
}
