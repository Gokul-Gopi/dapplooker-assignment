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
  isValidDate,
} from "../utils/helpers.js";

const router = express.Router();

router.get("/:wallet", async (req, res) => {
  const wallet = req.params.wallet;

  const start = req.query.start;
  const end = req.query.end;

  //Validation on parms and query
  if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
    return res.status(400).json({
      error: "invalid_wallet",
      message: "Wallet address is not valid.",
    });
  }

  if (!isValidDate(start) || !isValidDate(end)) {
    return res.status(400).json({
      error: "invalid_date",
      message: "Dates must be in YYYY-MM-DD format",
    });
  }

  if (new Date(start) > new Date(end)) {
    return res.status(400).json({
      error: "invalid_range",
      message: "Start date must be before end date.",
    });
  }

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

    //In case of empty wallet
    if (funding.length === 0 && ledger.length === 0 && fills.length === 0) {
      return res.json({
        daily: [],
        summary: {
          total_realized_pnl_usd: 0,
          total_unrealized_pnl_usd: 0,
          total_funding_usd: 0,
          total_fees_usd: 0,
          total_net_pnl_usd: 0,
          equity_start_usd: 0,
          equity_end_usd: 0,
        },
        diagnostics: {
          empty_wallet: true,
          message: "No trading activity or balance found",
          last_api_call: new Date().toISOString(),
          data_source: "hyperliquid",
        },
      });
    }

    // Init daily buckets
    const daily = createDailyBuckets(start, end);

    // Accumulate
    accumulateFunding(daily, funding);
    accumulateLedger(daily, ledger);
    accumulateFills(daily, fills);
    applyUnrealizedToLastDay(daily, state);

    // Compute net and equity
    computeNetAndEquity(daily, 0);

    // Summary & Diagnostics
    const summary = buildSummary(daily);

    const diagnostics = {
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
      diagnostics,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
