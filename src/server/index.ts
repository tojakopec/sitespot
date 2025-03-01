import express, { Request, Response } from "express";
import session from "express-session";
import Redis from "redis";
import { RedisStore } from "connect-redis";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import usersRouter from "./routes/users";
import sitesRouter from "./routes/sites";
import jobsRouter from "./routes/jobs";
import contractsRouter from "./routes/contracts";
import authRouter from "./auth/auth";
import { sessionConfig } from "./config/session";
import {
  doubleCsrfProtection,
  csrfTokenRoute,
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

// Cookie parser middleware - must be before CSRF middleware
// If COOKIE_SECRET is defined, use it for signed cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

// Session middleware
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

// CSRF token generation route - must be registered BEFORE CSRF protection
app.get("/api/v1/csrf-token", csrfTokenRoute);

// CSRF protection for non-GET routes
app.use(doubleCsrfProtection);

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/sites", sitesRouter);
app.use("/api/v1/jobs/", jobsRouter);
app.use("/api/v1/contracts", contractsRouter);

// Error handlers
app.use(handleCSRFError);
// Add general error handler
app.use((err: Error, _req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT} `);
});
