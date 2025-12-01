import express from "express";
import cors from "cors";

import testRoutes from "./routes/test.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/test", testRoutes);

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

export default app;
