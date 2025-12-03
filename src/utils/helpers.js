import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true });

export const validateData = (data, schema) => {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    return {
      success: false,
      errors: validate.errors,
    };
  }

  return { success: true };
};

export const extractJson = (text) => {
  if (!text) return null;

  const match = text.match(/\{[\s\S]*\}/);

  return match ? match[0] : null;
};

export const hlInfo = async (body) => {
  const url = "https://api.hyperliquid.xyz/info";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return res.json();
  } catch (error) {
    throw error;
  }
};

export const getDateRange = (start, end) => {
  const dates = [];
  const cur = new Date(start);

  while (cur <= new Date(end)) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }

  return dates;
};

export const createDailyBuckets = (start, end) => {
  const days = getDateRange(start, end);
  const daily = {};

  for (const day of days) {
    daily[day] = {
      date: day,
      realized_pnl_usd: 0,
      funding_usd: 0,
      fees_usd: 0,
      unrealized_pnl_usd: 0,
      net_pnl_usd: 0,
      equity_usd: 0,
    };
  }

  return daily;
};

export const accumulateFunding = (daily, fundingEvents) => {
  for (const ev of fundingEvents) {
    const day = new Date(ev.time).toISOString().split("T")[0];

    if (!daily[day]) continue;

    const amount = Number(ev.delta.usdc);
    daily[day].funding_usd += amount;
  }
};

export const accumulateLedger = (daily, ledgerEvents) => {
  for (const ev of ledgerEvents) {
    const day = new Date(ev.time).toISOString().split("T")[0];
    if (!daily[day]) continue;

    const { type, usdc } = ev.delta;
    const amount = Number(usdc);

    if (type === "fee") {
      daily[day].fees_usd += amount;
    }

    if (type === "pnl") {
      daily[day].realized_pnl_usd += amount;
    }
  }
};

export const accumulateFills = (daily, fills) => {
  if (!Array.isArray(fills)) return;

  for (const fill of fills) {
    const day = new Date(fill.time).toISOString().split("T")[0];

    if (!daily[day]) continue;

    // Only count fills that actually closed PnL
    if (fill.closedPnl !== undefined && fill.closedPnl !== null) {
      daily[day].realized_pnl_usd += Number(fill.closedPnl);
    }
  }
};

export const computeNetAndEquity = (daily, startingEquity = 0) => {
  let equity = startingEquity;
  const days = Object.keys(daily);

  for (const d of days) {
    const row = daily[d];

    row.net_pnl_usd =
      row.realized_pnl_usd +
      row.funding_usd -
      row.fees_usd +
      row.unrealized_pnl_usd;

    equity += row.net_pnl_usd;
    row.equity_usd = equity;
  }
};

export const applyUnrealizedToLastDay = (daily, state) => {
  const days = Object.keys(daily);
  const lastDay = days[days.length - 1];

  let totalUnrealized = 0;

  for (const pos of state.assetPositions || []) {
    const size = Number(pos.position.szi);
    const entry = Number(pos.position.entryPx);
    const mark = Number(pos.markPx);

    totalUnrealized += (mark - entry) * size;
  }

  daily[lastDay].unrealized_pnl_usd = totalUnrealized;
};

export const buildSummary = (daily) => {
  const rows = Object.values(daily);

  let realized = 0;
  let unrealized = 0;
  let funding = 0;
  let fees = 0;
  let net = 0;
  let equityStart = 0;
  let equityEnd = 0;

  rows.forEach((row, i) => {
    realized += row.realized_pnl_usd;
    unrealized += row.unrealized_pnl_usd;
    funding += row.funding_usd;
    fees += row.fees_usd;
    net += row.net_pnl_usd;

    if (i === 0) equityStart = row.equity_usd;
    if (i === rows.length - 1) equityEnd = row.equity_usd;
  });

  return {
    total_realized_pnl_usd: realized,
    total_unrealized_pnl_usd: unrealized,
    total_funding_usd: funding,
    total_fees_usd: fees,
    total_net_pnl_usd: net,
    equity_start_usd: equityStart,
    equity_end_usd: equityEnd,
  };
};
