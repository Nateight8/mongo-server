const mockTradeAnalytics = [
  {
    symbol: "EUR/USD",
    category: "forex",
    performance: [
      { time: "2025-01-01", pnl: 850 },
      { time: "2025-02-01", pnl: -420 },
      { time: "2025-03-01", pnl: 1650 },
      { time: "2025-04-01", pnl: -890 },
      { time: "2025-05-01", pnl: 2100 },
      { time: "2025-06-01", pnl: 320 },
      { time: "2025-07-01", pnl: -1200 },
      { time: "2025-08-01", pnl: 1850 },
      { time: "2025-09-01", pnl: -650 },
      { time: "2025-10-01", pnl: 2400 },
    ],
  },
  {
    symbol: "USD/JPY",
    category: "forex",
    performance: [
      { time: "2025-01-01", pnl: -850 },
      { time: "2025-02-01", pnl: 450 },
      { time: "2025-03-01", pnl: -1200 },
      { time: "2025-04-01", pnl: 1800 },
      { time: "2025-05-01", pnl: -320 },
      { time: "2025-06-01", pnl: 980 },
      { time: "2025-07-01", pnl: -1500 },
      { time: "2025-08-01", pnl: 2200 },
      { time: "2025-09-01", pnl: 150 },
      { time: "2025-10-01", pnl: -780 },
    ],
  },
  {
    symbol: "GBP/USD",
    category: "forex",
    performance: [
      { time: "2025-01-01", pnl: 1200 },
      { time: "2025-02-01", pnl: -980 },
      { time: "2025-03-01", pnl: 650 },
      { time: "2025-04-01", pnl: 1450 },
      { time: "2025-05-01", pnl: -1100 },
      { time: "2025-06-01", pnl: 2100 },
      { time: "2025-07-01", pnl: -420 },
      { time: "2025-08-01", pnl: 1800 },
      { time: "2025-09-01", pnl: -950 },
      { time: "2025-10-01", pnl: 1350 },
    ],
  },
  {
    symbol: "BTC/USD",
    category: "crypto",
    performance: [
      { time: "2025-01-01", pnl: 3500 },
      { time: "2025-02-01", pnl: -2800 },
      { time: "2025-03-01", pnl: 7200 },
      { time: "2025-04-01", pnl: -4500 },
      { time: "2025-05-01", pnl: 8900 },
      { time: "2025-06-01", pnl: -3200 },
      { time: "2025-07-01", pnl: 5800 },
      { time: "2025-08-01", pnl: -6500 },
      { time: "2025-09-01", pnl: 12400 },
      { time: "2025-10-01", pnl: -8200 },
      { time: "2025-11-01", pnl: 15600 },
      { time: "2025-12-01", pnl: -4800 },
    ],
  },
  {
    symbol: "ETH/USD",
    category: "crypto",
    performance: [
      { time: "2025-01-01", pnl: 2200 },
      { time: "2025-02-01", pnl: -1800 },
      { time: "2025-03-01", pnl: 4500 },
      { time: "2025-04-01", pnl: -2100 },
      { time: "2025-05-01", pnl: 5800 },
      { time: "2025-06-01", pnl: 1200 },
      { time: "2025-07-01", pnl: -3500 },
      { time: "2025-08-01", pnl: 6800 },
      { time: "2025-09-01", pnl: -2400 },
      { time: "2025-10-01", pnl: 7200 },
      { time: "2025-11-01", pnl: -4200 },
      { time: "2025-12-01", pnl: 3800 },
    ],
  },
  {
    symbol: "XRP/USD",
    category: "crypto",
    performance: [
      { time: "2025-01-01", pnl: -650 },
      { time: "2025-02-01", pnl: 1200 },
      { time: "2025-03-01", pnl: -890 },
      { time: "2025-04-01", pnl: 2100 },
      { time: "2025-05-01", pnl: -1400 },
      { time: "2025-06-01", pnl: 3200 },
      { time: "2025-07-01", pnl: -850 },
      { time: "2025-08-01", pnl: 1800 },
    ],
  },
  {
    symbol: "AAPL",
    category: "stock",
    performance: [
      { time: "2025-01-01", pnl: 1850 },
      { time: "2025-02-01", pnl: -1200 },
      { time: "2025-03-01", pnl: 2800 },
      { time: "2025-04-01", pnl: 450 },
      { time: "2025-05-01", pnl: -980 },
      { time: "2025-06-01", pnl: 3200 },
      { time: "2025-07-01", pnl: -1850 },
      { time: "2025-08-01", pnl: 2400 },
      { time: "2025-09-01", pnl: 850 },
      { time: "2025-10-01", pnl: -1400 },
    ],
  },
  {
    symbol: "TSLA",
    category: "stock",
    performance: [
      { time: "2025-01-01", pnl: 2800 },
      { time: "2025-02-01", pnl: -3500 },
      { time: "2025-03-01", pnl: 5200 },
      { time: "2025-04-01", pnl: -2100 },
      { time: "2025-05-01", pnl: 6800 },
      { time: "2025-06-01", pnl: -4200 },
      { time: "2025-07-01", pnl: 3800 },
      { time: "2025-08-01", pnl: -1800 },
      { time: "2025-09-01", pnl: 4500 },
      { time: "2025-10-01", pnl: -2800 },
    ],
  },
  {
    symbol: "MSFT",
    category: "stock",
    performance: [
      { time: "2025-01-01", pnl: 1450 },
      { time: "2025-02-01", pnl: 850 },
      { time: "2025-03-01", pnl: -650 },
      { time: "2025-04-01", pnl: 2200 },
      { time: "2025-05-01", pnl: 1100 },
      { time: "2025-06-01", pnl: -980 },
      { time: "2025-07-01", pnl: 2800 },
      { time: "2025-08-01", pnl: -1200 },
      { time: "2025-09-01", pnl: 1950 },
    ],
  },
  {
    symbol: "GOOGL",
    category: "stock",
    performance: [
      { time: "2025-01-01", pnl: 2400 },
      { time: "2025-02-01", pnl: -1800 },
      { time: "2025-03-01", pnl: 1200 },
      { time: "2025-04-01", pnl: 3500 },
      { time: "2025-05-01", pnl: -2200 },
      { time: "2025-06-01", pnl: 1850 },
      { time: "2025-07-01", pnl: -950 },
      { time: "2025-08-01", pnl: 2800 },
      { time: "2025-09-01", pnl: 420 },
    ],
  },
  {
    symbol: "LTC/USD",
    category: "crypto",
    performance: [
      { time: "2025-01-01", pnl: 650 },
      { time: "2025-02-01", pnl: -850 },
      { time: "2025-03-01", pnl: 1400 },
      { time: "2025-04-01", pnl: -420 },
      { time: "2025-05-01", pnl: 1800 },
      { time: "2025-06-01", pnl: -1200 },
      { time: "2025-07-01", pnl: 2100 },
      { time: "2025-08-01", pnl: -650 },
    ],
  },
  {
    symbol: "AUD/USD",
    category: "forex",
    performance: [
      { time: "2025-01-01", pnl: -450 },
      { time: "2025-02-01", pnl: 1200 },
      { time: "2025-03-01", pnl: -850 },
      { time: "2025-04-01", pnl: 1650 },
      { time: "2025-05-01", pnl: 320 },
      { time: "2025-06-01", pnl: -980 },
      { time: "2025-07-01", pnl: 1450 },
      { time: "2025-08-01", pnl: -720 },
    ],
  },
  {
    symbol: "NZD/USD",
    category: "forex",
    performance: [
      { time: "2025-01-01", pnl: 1450 },
      { time: "2025-01-02", pnl: 850 },
      { time: "2025-01-03", pnl: -650 },
      { time: "2025-01-04", pnl: 2200 },
      { time: "2025-01-05", pnl: 1100 },
      { time: "2025-01-06", pnl: -980 },
      { time: "2025-01-07", pnl: 2800 },
      { time: "2025-01-08", pnl: -1200 },
      { time: "2025-01-09", pnl: 1950 },
      { time: "2025-01-10", pnl: 620 },
      { time: "2025-01-11", pnl: -850 },
      { time: "2025-01-12", pnl: 2450 },
      { time: "2025-01-13", pnl: -580 },
      { time: "2025-01-14", pnl: 1800 },
      { time: "2025-01-15", pnl: 950 },
      { time: "2025-01-16", pnl: -1150 },
      { time: "2025-01-17", pnl: 2650 },
      { time: "2025-01-18", pnl: -420 },
      { time: "2025-01-19", pnl: 1950 },
      { time: "2025-01-20", pnl: 750 },
      { time: "2025-01-21", pnl: -1200 },
      { time: "2025-01-22", pnl: 2450 },
      { time: "2025-01-23", pnl: -650 },
      { time: "2025-01-24", pnl: 1850 },
      { time: "2025-01-25", pnl: 520 },
      { time: "2025-01-26", pnl: -950 },
      { time: "2025-01-27", pnl: 2750 },
      { time: "2025-01-28", pnl: -480 },
    ],
  },
  {
    symbol: "META",
    category: "stock",
    performance: [
      { time: "2025-01-01", pnl: 1200 },
      { time: "2025-02-01", pnl: -1850 },
      { time: "2025-03-01", pnl: 2400 },
      { time: "2025-04-01", pnl: -850 },
      { time: "2025-05-01", pnl: 3200 },
      { time: "2025-06-01", pnl: 650 },
      { time: "2025-07-01", pnl: -1400 },
      { time: "2025-08-01", pnl: 2100 },
    ],
  },
  {
    symbol: "NFLX",
    category: "stock",
    performance: [
      { time: "2025-01-01", pnl: 2800 },
      { time: "2025-01-02", pnl: -3500 },
      { time: "2025-01-03", pnl: 5200 },
      { time: "2025-01-04", pnl: -2100 },
      { time: "2025-01-05", pnl: 6800 },
      { time: "2025-01-06", pnl: -4200 },
      { time: "2025-01-07", pnl: 3800 },
      { time: "2025-01-08", pnl: -1800 },
      { time: "2025-01-09", pnl: 4500 },
      { time: "2025-01-10", pnl: -2800 },
      { time: "2025-01-11", pnl: 5800 },
      { time: "2025-01-12", pnl: -3200 },
      { time: "2025-01-13", pnl: 4200 },
      { time: "2025-01-14", pnl: -2500 },
      { time: "2025-01-15", pnl: 6200 },
      { time: "2025-01-16", pnl: -1800 },
      { time: "2025-01-17", pnl: 3500 },
      { time: "2025-01-18", pnl: -4500 },
      { time: "2025-01-19", pnl: 7200 },
      { time: "2025-01-20", pnl: -2800 },
      { time: "2025-01-21", pnl: 4800 },
      { time: "2025-01-22", pnl: -3800 },
      { time: "2025-01-23", pnl: 5500 },
      { time: "2025-01-24", pnl: -1500 },
      { time: "2025-01-25", pnl: 6500 },
      { time: "2025-01-26", pnl: -4200 },
      { time: "2025-01-27", pnl: 3800 },
      { time: "2025-01-28", pnl: -2200 },
      { time: "2025-01-29", pnl: 5800 },
      { time: "2025-01-30", pnl: -3500 },
    ],
  },
  {
    symbol: "DOGE/USD",
    category: "crypto",
    performance: [
      { time: "2025-01-01", pnl: 320 },
      { time: "2025-02-01", pnl: -850 },
      { time: "2025-03-01", pnl: 1400 },
      { time: "2025-04-01", pnl: -620 },
      { time: "2025-05-01", pnl: 2100 },
      { time: "2025-06-01", pnl: -1450 },
      { time: "2025-07-01", pnl: 1800 },
      { time: "2025-08-01", pnl: -980 },
    ],
  },
  {
    symbol: "USD/CAD",
    category: "forex",
    performance: [
      { time: "2025-01-01", pnl: 420 },
      { time: "2025-02-01", pnl: -280 },
      { time: "2025-03-01", pnl: 650 },
      { time: "2025-04-01", pnl: 180 },
      { time: "2025-05-01", pnl: -520 },
      { time: "2025-06-01", pnl: 850 },
      { time: "2025-07-01", pnl: -320 },
    ],
  },
  {
    symbol: "NVDA",
    category: "stock",
    performance: [
      { time: "2025-01-01", pnl: 2800 },
      { time: "2025-02-01", pnl: -2200 },
      { time: "2025-03-01", pnl: 4500 },
      { time: "2025-04-01", pnl: -1800 },
      { time: "2025-05-01", pnl: 6200 },
      { time: "2025-06-01", pnl: -3500 },
      { time: "2025-07-01", pnl: 5800 },
      { time: "2025-08-01", pnl: -2800 },
      { time: "2025-09-01", pnl: 7200 },
    ],
  },
  {
    symbol: "ETH/BTC",
    category: "crypto",
    performance: [
      { time: "2025-01-01", pnl: 850 },
      { time: "2025-02-01", pnl: -1200 },
      { time: "2025-03-01", pnl: 1650 },
      { time: "2025-04-01", pnl: -450 },
      { time: "2025-05-01", pnl: 2100 },
      { time: "2025-06-01", pnl: -980 },
      { time: "2025-07-01", pnl: 1450 },
    ],
  },
  {
    symbol: "IBM",
    category: "stock",
    performance: [
      { time: "2025-01-01", pnl: 2800 },
      { time: "2025-01-02", pnl: -3500 },
      { time: "2025-01-03", pnl: 5200 },
      { time: "2025-01-04", pnl: -2100 },
      { time: "2025-01-05", pnl: 6800 },
      { time: "2025-01-06", pnl: -4200 },
      { time: "2025-01-07", pnl: 3800 },
      { time: "2025-01-08", pnl: -1800 },
      { time: "2025-01-09", pnl: 4500 },
      { time: "2025-01-10", pnl: -2800 },
      { time: "2025-01-11", pnl: 5800 },
      { time: "2025-01-12", pnl: -3200 },
      { time: "2025-01-13", pnl: 4200 },
      { time: "2025-01-14", pnl: -2500 },
      { time: "2025-01-15", pnl: 6200 },
      { time: "2025-01-16", pnl: -1800 },
      { time: "2025-01-17", pnl: 3500 },
      { time: "2025-01-18", pnl: -4500 },
      { time: "2025-01-19", pnl: 7200 },
      { time: "2025-01-20", pnl: -2800 },
      { time: "2025-01-21", pnl: 4800 },
      { time: "2025-01-22", pnl: -3800 },
      { time: "2025-01-23", pnl: 5500 },
      { time: "2025-01-24", pnl: -1500 },
      { time: "2025-01-25", pnl: 6500 },
      { time: "2025-01-26", pnl: -4200 },
      { time: "2025-01-27", pnl: 3800 },
      { time: "2025-01-28", pnl: -2200 },
      { time: "2025-01-29", pnl: 5800 },
      { time: "2025-01-30", pnl: -3500 },
    ],
  },
];

export const equityCurveData = [
  { time: "2025-01-01", equity: 10000 },
  { time: "2025-01-05", equity: 10450 },
  { time: "2025-01-10", equity: 9850 },
  { time: "2025-01-15", equity: 10750 },
  { time: "2025-01-20", equity: 9950 },
  { time: "2025-01-25", equity: 11200 },
  { time: "2025-01-30", equity: 10800 },
  { time: "2025-02-05", equity: 12100 },
  { time: "2025-02-10", equity: 11350 },
  { time: "2025-02-15", equity: 13200 },
  { time: "2025-02-20", equity: 12450 },
  { time: "2025-02-25", equity: 11800 },
  { time: "2025-03-01", equity: 13800 },
  { time: "2025-03-05", equity: 12950 },
  { time: "2025-03-10", equity: 14500 },
  { time: "2025-03-15", equity: 13200 },
  { time: "2025-03-20", equity: 15100 },
  { time: "2025-03-25", equity: 14200 },
  { time: "2025-03-30", equity: 16800 },
  { time: "2025-04-05", equity: 15450 },
  { time: "2025-04-10", equity: 17200 },
  { time: "2025-04-15", equity: 16100 },
  { time: "2025-04-20", equity: 18500 },
  { time: "2025-04-25", equity: 17200 },
  { time: "2025-04-30", equity: 19800 },
  { time: "2025-05-05", equity: 18450 },
  { time: "2025-05-10", equity: 20200 },
  { time: "2025-05-15", equity: 19100 },
  { time: "2025-05-20", equity: 21500 },
  { time: "2025-05-25", equity: 20800 },
];

export { mockTradeAnalytics };
