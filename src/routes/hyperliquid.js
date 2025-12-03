import express from "express";
import {
  accumulateFills,
  accumulateFunding,
  accumulateLedger,
  applyUnrealizedToLastDay,
  buildSummary,
  computeNetAndEquity,
  createDailyBuckets,
  hlInfo,
} from "../utils/helpers.js";

const router = express.Router();

router.get("/:wallet", async (req, res) => {
  const wallet = req.params.wallet;

  const start = req.query.start;
  const end = req.query.end;
  const startDate = new Date(start + "T00:00:00Z").getTime();
  const endDate = new Date(end + "T23:59:59Z").getTime();

  try {
    // Getting wallet data from Hyperliquid
    const funding = await hlInfo({
      type: "userFunding",
      user: wallet,
      startDate,
      endDate,
    });
    const ledger = await hlInfo({
      type: "userNonFundingLedgerUpdates",
      user: wallet,
      startDate,
      endDate,
    });
    const fills = await hlInfo({
      type: "userFills",
      user: wallet,
      startDate,
      endDate,
    });
    const state = await hlInfo({
      user: wallet,
      type: "clearinghouseState",
    });

    const daily = createDailyBuckets(start, end);
    accumulateFunding(daily, funding);
    accumulateLedger(daily, ledger);
    accumulateFills(daily, fills);
    applyUnrealizedToLastDay(daily, state);

    computeNetAndEquity(daily, 0);

    const summary = buildSummary(daily);

    const diagnostic = {
      last_api_call: new Date().toISOString(),
      data_source: "hyperliquid",
      notes: "PnL calculated using daily close prices",
    };

    return res.json({
      wallet,
      start,
      end,
      daily: Object.values(daily),
      summary,
      diagnostic,
    });
  } catch (error) {
    console.error("Error fetching Hyperliquid data:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
