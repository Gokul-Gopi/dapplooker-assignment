import express from "express";
import cors from "cors";

import testRoutes from "./routes/test.js";
import tokenRoutes from "./routes/token.js";
import hyperliquidRoutes from "./routes/hyperliquid.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/test", testRoutes);
app.use("/api/token", tokenRoutes);
app.use("/api/hyperliquid", hyperliquidRoutes);

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

export default app;
