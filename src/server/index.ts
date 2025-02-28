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

dotenv.config();

const redisClient = Redis.createClient();
redisClient.connect().catch(console.error);
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "sitespot",
});

const app = express();

app.use(
  session({
    store: redisStore,
    resave: false,
    saveUninitialized: false,
    secret: process.env.REDIS_SECRET!,
  })
);

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/sites", sitesRouter);
app.use("/api/v1/jobs/", jobsRouter);
app.use("/api/v1/contracts", contractsRouter);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT} `);
});
