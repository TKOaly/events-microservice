import * as knex from "knex";
import * as R from "ramda";

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

export async function getAllCalendarEvents(fromDate: string): Promise<CalendarEvent[]> {
  const query = await db("calendar_events")
    .select()
    .where('starts', '>', new Date(fromDate));
  return R.map(parseQueryResult, query) as CalendarEvent[];
}

function parseQueryResult(row: object) {
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
