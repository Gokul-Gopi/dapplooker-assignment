import express from "express";
import { getInsightPrompt } from "../utils/prompt.js";
import { askAI } from "../services/aiClient.js";
import { extractJson, validateData } from "../utils/helpers.js";
import { insightResponseSchema } from "../utils/responseSchema.js";

const router = express.Router();

const baseUrl = "https://api.coingecko.com/api/v3/coins";
const MAX_RETRIES = 3;

router.post("/:id/insight", async (req, res) => {
  const id = req.params.id;

  if (!id) return res.status(400).json({ error: "Token ID is required" });

  const currency = req.body?.vs_currency || "usd";
  const days = req.body?.days || "30";

  const url = new URL(`${baseUrl}/${id}/market_chart`);
  url.searchParams.append("vs_currency", currency);
  url.searchParams.append("days", days);

  try {
    const data = await Promise.all([
      fetch(`${baseUrl}/${id}`).then((response) => response.json()),
      fetch(url.toString()).then((response) => response.json()),
    ]).then(([coinInfo, marketChart]) => ({
      coinInfo,
      marketChart,
    }));

    const tokenData = {
      source: "coingecko",
      token: {
        id: data.coinInfo.id,
        symbol: data.coinInfo.symbol,
        name: data.coinInfo.name,
        market_data: {
          [`current_price_${currency}`]:
            data.coinInfo.market_data.current_price[currency],
          [`market_cap_${currency}`]:
            data.coinInfo.market_data.market_cap[currency],
          [`total_volume_${currency}`]:
            data.coinInfo.market_data.total_volume[currency],
          [`price_change_percentage_24h`]:
            data.coinInfo.market_data.price_change_percentage_24h,
        },
      },
      insight:
        "No insight could be generated, at the moment. Please try again later.",
      model: {
        provider: "groq",
        model_name: "llama-3.3-70b-versatile",
      },
    };

    const formattedPrices = data.marketChart.prices.map(([ts, price]) => ({
      date: new Date(ts).toISOString(),
      price,
    }));

    //30-day % change
    const first = formattedPrices[0].price;
    const last = formattedPrices.at(-1).price;
    const change30d = ((last - first) / first) * 100;

    // 24h volatility
    const last24 = formattedPrices.slice(-24);
    const pricesArr = last24.map((p) => p.price);
    const max = Math.max(...pricesArr);
    const min = Math.min(...pricesArr);
    const volatility = ((max - min) / min) * 100;

    //Trend
    const trend = last > first ? "uptrend" : "downtrend";

    const prompt = getInsightPrompt(
      tokenData.token.name,
      tokenData.token.symbol,
      tokenData.token.market_data[`current_price_${currency}`],
      tokenData.token.market_data[`market_cap_${currency}`],
      tokenData.token.market_data[`total_volume_${currency}`],
      tokenData.token.market_data[`price_change_percentage_24h`],
      change30d,
      trend,
      volatility,
      currency
    );

    // Retry if AI response is invalid
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const rawResponse = await askAI(prompt);

        const jsonText = extractJson(rawResponse);

        if (!jsonText) {
          if (attempt === MAX_RETRIES) {
            return res.json(tokenData);
          }
          continue;
        }

        const aiInsight = JSON.parse(jsonText);

        const validData = validateData(aiInsight, insightResponseSchema);

        if (!validData.success) {
          if (attempt === MAX_RETRIES) {
            return res.json(tokenData);
          }
          continue;
        }

        tokenData.insight = aiInsight;

        return res.json(tokenData);
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          return res.json(tokenData);
        }
      }
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
