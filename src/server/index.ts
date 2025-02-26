import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./routes/users";
import sitesRouter from "./routes/sites";
import jobsRouter from "./routes/jobs";
import contractsRouter from "./routes/contracts";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/sites", sitesRouter);
app.use("/api/v1/jobs/", jobsRouter);
app.use("/api/v1/contracts", contractsRouter);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT} `);
});
