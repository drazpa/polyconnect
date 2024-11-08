import React, { memo, useState, useCallback, useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { usePortfolioValue } from '../hooks/usePortfolioValue';

const TIME_RANGES = [
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
] as const;

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

const CustomTooltip = memo(({ active, payload }: any) => {
  if (active && payload?.[0]) {
    return (
      <div className="glass-card p-3 rounded-lg shadow-lg border border-purple-500/20">
        <p className="text-gray-600">{payload[0].payload.date}</p>
        <p className="text-lg font-semibold text-purple-600">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = 'CustomTooltip';

export function PortfolioChart() {
  const { totalValue, generateHistoricalData } = usePortfolioValue();
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES[1]);

  // Memoize historical data based on total value and selected range
  const valueHistory = useMemo(() => 
    generateHistoricalData(selectedRange.days),
    [generateHistoricalData, selectedRange.days, totalValue]
  );

  const handleRangeChange = useCallback((range: typeof TIME_RANGES[number]) => {
    setSelectedRange(range);
  }, []);

  return (
    <div className="glass-card rounded-xl p-6 purple-glow purple-glow-hover relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent"></div>
      <div className="relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
              Portfolio Value
            </h2>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(totalValue)}
            </p>
          </div>
          <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range.label}
                onClick={() => handleRangeChange(range)}
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
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={valueHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#374151"
              opacity={0.3}
            />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF' }}
              tickFormatter={formatCurrency}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#purpleGradient)"
              strokeWidth={2}
              fill="url(#colorValue)"
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}