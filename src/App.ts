import * as dotenv from "dotenv";
dotenv.config();

import * as express from "express";

import * as calendarEventService from "./services/calendarEventService";

async function startServer(servicePort: number) {
  const app = express();

  app.get(
    "/events",
    authorizeRequest,
    async (req: express.Request, res: express.Response) => {
      const fromDate = req.query.fromDate
      try {
        const calendarEvents = await calendarEventService.getAllCalendarEvents(fromDate);
        return res.status(200).json(calendarEvents);
      } catch (e) {
        res.status(500).json({error: "internal server error"});
      }
  });

  app.listen(servicePort);
}

function authorizeRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.get("X-Token") === process.env.SERVICE_AUTH_TOKEN) {
    return next();
  }
  return res.status(401).json({error: "unauthorized"});
}

startServer(Number(process.env.SERVICE_PORT || 3001));
