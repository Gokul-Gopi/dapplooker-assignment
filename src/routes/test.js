import express from "express";
import { askAI } from "../services/aiClient.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  const prompt = req.body.prompt || "Hey, How are you bro?";

  try {
    const response = await askAI(prompt);
    return res.json({ response });
  } catch (error) {
    console.log("Error in /test/chat:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
