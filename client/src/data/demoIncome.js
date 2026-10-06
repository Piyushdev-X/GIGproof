export const monthlyIncome = [
  { month: 'Oct', total: 26800, sources: [12200, 10100, 4500] },
  { month: 'Nov', total: 31800, sources: [14400, 11200, 6200] },
  { month: 'Dec', total: 24200, sources: [10500, 9300, 4400] },
  { month: 'Jan', total: 35600, sources: [16300, 12500, 6800] },
  { month: 'Feb', total: 28750, sources: [12800, 10600, 5350] },
  { month: 'Mar', total: 41200, sources: [18900, 14100, 8200] },
  { month: 'Apr', total: 37900, sources: [17200, 13600, 7100] },
  { month: 'May', total: 44300, sources: [20400, 15300, 8600] },
  { month: 'Jun', total: 32600, sources: [14900, 11800, 5900] },
  { month: 'Jul', total: 39850, sources: [18100, 14400, 7350] },
  { month: 'Aug', total: 34700, sources: [15800, 12600, 6300] },
  { month: 'Sep', total: 42400, sources: [19300, 15400, 7700] },
];

export const connections = [
  { name: 'Zomato', detail: 'Connected Sep 18, 2026', mark: 'Z', tone: 'orange' },
  { name: 'Upwork', detail: 'Connected Sep 17, 2026', mark: 'u', tone: 'green' },
  { name: 'Ola', detail: 'Connected Sep 16, 2026', mark: 'O', tone: 'charcoal' },
];

export const payouts = [
  { platform: 'Zomato', date: 'Sep 29, 2026', amount: 8750, mark: 'Z', tone: 'orange' },
  { platform: 'Upwork', date: 'Sep 27, 2026', amount: 12500, mark: 'u', tone: 'green' },
  { platform: 'Ola', date: 'Sep 24, 2026', amount: 4600, mark: 'O', tone: 'charcoal' },
  { platform: 'Zomato', date: 'Sep 22, 2026', amount: 7900, mark: 'Z', tone: 'orange' },
];

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount);

export const formatCompactCurrency = (amount) =>
  `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount / 1000)}k`;
