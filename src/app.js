import express from "express";
import cors from "cors";

import testRoutes from "./routes/test.js";
import tokenRoutes from "./routes/token.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/test", testRoutes);
app.use("/api/token", tokenRoutes);

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

export default app;
