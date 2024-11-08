import React, { memo } from 'react';
import { useTokenPrices } from '../hooks/useTokenPrices';
import { TrendingUp, TrendingDown } from 'lucide-react';

const formatPrice = (price: number) => 
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(price);

const PriceTickerItem = memo(({ symbol, data }: { 
  symbol: string; 
  data: { price: number; change24h: number; } 
}) => {
  const isPositive = data.change24h >= 0;
  
  return (
    <div className="flex items-center gap-2 glass-card px-3 py-1.5 purple-glow">
      <span className="text-sm font-medium text-gray-700">{symbol}</span>
      <span className="text-sm font-medium text-gray-900">
        {formatPrice(data.price)}
      </span>
      <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        <span className="text-xs ml-0.5">
          {isPositive ? '+' : ''}{data.change24h.toFixed(1)}%
        </span>
      </div>
    </div>
  );
});

PriceTickerItem.displayName = 'PriceTickerItem';

export function PriceTicker() {
  const { tokenData, loading } = useTokenPrices();

  if (loading) {
    return (
      <div className="hidden md:flex gap-4">
        <div className="animate-pulse h-6 w-24 bg-purple-500/10 rounded"></div>
        <div className="animate-pulse h-6 w-24 bg-purple-500/10 rounded"></div>
        <div className="animate-pulse h-6 w-24 bg-purple-500/10 rounded"></div>
        <div className="animate-pulse h-6 w-24 bg-purple-500/10 rounded"></div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-4">
      {['USDT', 'USDC', 'POL', 'MATIC'].map((symbol) => {
        const data = tokenData[symbol];
        if (!data) return null;
        
        return (
          <PriceTickerItem 
            key={symbol} 
            symbol={symbol} 
            data={data} 
          />
        );
      })}
    </div>
  );
}