import express from "express";
import session from "express-session";
import Redis from "redis";
import { RedisStore } from "connect-redis";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./routes/users";
import sitesRouter from "./routes/sites";
import jobsRouter from "./routes/jobs";
import contractsRouter from "./routes/contracts";
import authRouter from "./auth/auth";
import { sessionConfig } from "./config/session";
import {
  attachCsrfToken,
  csrfProtection,
  handleCSRFError,
} from "./middleware/csrf";

dotenv.config();

const redisClient = Redis.createClient();
redisClient.connect().catch(console.error);
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "sitespot",
});

const app = express();

// Configure CORS with specific origin for security
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    store: redisStore,
    resave: false,
    saveUninitialized: false,
    secret: process.env.REDIS_SECRET!,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: sessionConfig.defaultDuration,
    },
  })
);

// CSRF protection
app.use(attachCsrfToken);
app.use(csrfProtection);

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/sites", sitesRouter);
app.use("/api/v1/jobs/", jobsRouter);
app.use("/api/v1/contracts", contractsRouter);

// Error handlers
app.use(handleCSRFError);
// Add general error handler
app.use((err: Error, _req: express.Request, res: express.Response) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT} `);
});
