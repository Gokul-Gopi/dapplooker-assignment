export const getInsightPrompt = (
  name,
  symbol,
  current_price,
  market_cap,
  total_volume,
  price_change_24h,
  change30d,
  trend,
  volatility,
  vs_currency
) => {
  return `You are a crypto market analyst. Analyze the following token data and return ONLY a valid JSON object with: {"reasoning":"short explanation","sentiment":"Bullish | Bearish | Neutral"} Token Info: Name: ${name}, Symbol: ${symbol.toUpperCase()}, Current Price (${vs_currency.toUpperCase()}): ${current_price}, Market Cap (${vs_currency.toUpperCase()}): ${market_cap}, 24h Volume (${vs_currency.toUpperCase()}): ${total_volume}, 24h Price Change: ${price_change_24h}%, 30d Price Change: ${change30d.toFixed(
    2
  )}%, Trend: ${trend}, Volatility (24h): ${volatility.toFixed(
    2
  )}%. Rules: Only return JSON. No markdown. No extra text.`;
};
