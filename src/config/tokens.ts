export const TOKENS = [
  {
    symbol: 'POL',
    name: 'Polygon',
    isNative: true,
    decimals: 18,
    coingeckoId: 'matic-network',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' as const,
    decimals: 6,
    coingeckoId: 'tether',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as const,
    decimals: 6,
    coingeckoId: 'usd-coin',
  },
] as const;