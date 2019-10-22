import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import * as calendarEventService from "./services/calendarEventService";

async function startServer(servicePort: number) {
  const app = express();

  app.get(
    "/events",
    authorizeRequest,
    async (req: express.Request, res: express.Response) => {
      try {
        const calendarEvents = await calendarEventService.getAllCalendarEvents();
        return res.status(200).json(calendarEvents);
      } catch (e) {
        return res.status(500).json({error: "Internal server error"});
      }
  });

  app.listen(servicePort, () => console.log("Listening on port " + servicePort));
}

function authorizeRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.get("X-Token") === process.env.SERVICE_AUTH_TOKEN) {
    return next();
  }
  return res.status(401).json({error: "unauthorized"});
}

startServer(Number(process.env.SERVICE_PORT || 3001));
