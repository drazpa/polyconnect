import React, { useState, useEffect } from 'react';
import { XCircle, ExternalLink, ArrowRightLeft, Wallet, TrendingUp, DollarSign } from 'lucide-react';
import { formatUnits } from 'viem';
import { Token } from '../types/token';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

interface Props {
  token: Token;
  balance: bigint;
  price: number;
  change24h: number;
  marketCap?: number;
  volume24h?: number;
  onClose: () => void;
  onVerify?: () => void;
}

interface PriceData {
  timestamp: number;
  price: number;
}

const TIME_RANGES = [
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
] as const;

export function TokenDetailsModal({ 
  token, 
  balance, 
  price, 
  change24h, 
  marketCap, 
  volume24h, 
  onClose,
  onVerify 
}: Props) {
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES[1]);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const formattedBalance = formatUnits(balance, token.decimals);
  const value = Number(formattedBalance) * price;

  useEffect(() => {
    async function fetchPriceHistory() {
      if (!token.coingeckoId) {
        setIsLoadingChart(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${token.coingeckoId}/market_chart?vs_currency=usd&days=${selectedRange.days}`
        );
        const data = await response.json();
        
        setPriceHistory(
          data.prices.map(([timestamp, price]: [number, number]) => ({
            timestamp,
            price,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch price history:', error);
      } finally {
        setIsLoadingChart(false);
      }
    }

    setIsLoadingChart(true);
    fetchPriceHistory();
  }, [token.coingeckoId, selectedRange.days]);

  const valueFormatter = (value: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);

  const minValue = Math.min(...priceHistory.map(d => d.price));
  const maxValue = Math.max(...priceHistory.map(d => d.price));
  const valueRange = maxValue - minValue;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="animate-in zoom-in-95 duration-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-xl border border-purple-100 shadow-xl">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white p-6 border-b border-purple-100">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 text-transparent bg-clip-text">
                  {token.name} ({token.symbol})
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xl font-semibold text-gray-900">
                    ${price.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </span>
                  <span className={`flex items-center text-sm ${change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Price Chart */}
            <div className="glass-card p-6 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-900">Price Chart</h4>
                <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
                  {TIME_RANGES.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setSelectedRange(range)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedRange.label === range.label
                          ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[300px]">
                {isLoadingChart ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={priceHistory}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#9333ea" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                      <XAxis 
                        dataKey="timestamp"
                        tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        domain={[minValue - valueRange * 0.1, maxValue + valueRange * 0.1]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={valueFormatter}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-purple-100">
                                <p className="text-gray-600">
                                  {new Date(data.timestamp).toLocaleString()}
                                </p>
                                <p className="text-lg font-semibold text-purple-600">
                                  {valueFormatter(data.price)}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="url(#purpleGradient)"
                        strokeWidth={2}
                        fill="url(#colorPrice)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-4 rounded-lg">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <Wallet className="w-5 h-5" />
                  <h5 className="font-semibold">Your Balance</h5>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {Number(formattedBalance).toLocaleString(undefined, { maximumFractionDigits: 6 })} {token.symbol}
                </p>
                <p className="text-lg text-purple-600">
                  ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="glass-card p-4 rounded-lg">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <h5 className="font-semibold">Market Cap</h5>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  ${marketCap?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Rank #{token.coingeckoId ? '#123' : 'N/A'}
                </p>
              </div>

              <div className="glass-card p-4 rounded-lg">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <h5 className="font-semibold">24h Volume</h5>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  ${volume24h?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  {((volume24h || 0) / (marketCap || 1) * 100).toFixed(2)}% of Market Cap
                </p>
              </div>
            </div>

            {/* Trading Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href={`https://app.uniswap.org/#/swap?inputCurrency=${token.address}&chain=polygon`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 rounded-lg hover:border-purple-300 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <ArrowRightLeft className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                  <div>
                    <h5 className="font-semibold text-gray-900">Trade</h5>
                    <p className="text-sm text-gray-600">Swap on Uniswap</p>
                  </div>
                </div>
              </a>

              <a
                href={`https://app.uniswap.org/#/pool?inputCurrency=${token.address}&chain=polygon`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 rounded-lg hover:border-purple-300 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                  <div>
                    <h5 className="font-semibold text-gray-900">Pool</h5>
                    <p className="text-sm text-gray-600">Add/Remove Liquidity</p>
                  </div>
                </div>
              </a>

              <a
                href={`https://polygonscan.com/token/${token.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 rounded-lg hover:border-purple-300 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                  <div>
                    <h5 className="font-semibold text-gray-900">Explorer</h5>
                    <p className="text-sm text-gray-600">View on PolygonScan</p>
                  </div>
                </div>
              </a>
            </div>

            {/* Verify Button */}
            {onVerify && (
              <button
                onClick={onVerify}
                className="w-full btn btn-primary mt-4"
              >
                Verify Token
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}