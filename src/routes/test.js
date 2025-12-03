import express from "express";
import { askAI } from "../services/aiClient.js";
import { extractJson, validateData } from "../utils/helpers.js";
import { testResponseSchema } from "../utils/responseSchema.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  const prompt = req.body.prompt || "Hey, How are you bro?";

  try {
    const response = await askAI(prompt);
    return res.json({ response: JSON.parse(response) });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/test-validator", async (req, res) => {
  const prompt = req.body.prompt || "{}";

  try {
    const rawResponse = await askAI(prompt);

    const jsonText = extractJson(rawResponse);

    if (!jsonText) {
      return res.status(400).json({ error: "No JSON found in AI response" });
    }

    const responseData = JSON.parse(jsonText);

    const validData = validateData(responseData, testResponseSchema);

    if (!validData.success) {
      return res
        .status(400)
        .json({ error: "Invalid response format", details: validData.errors });
    }

    return res.json({
      message: "Validator works!",
      data: responseData,
      originalResponse: rawResponse,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
