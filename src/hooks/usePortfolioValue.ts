import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTokenBalances } from './useTokenBalances';
import { useTokenPrices } from './useTokenPrices';
import { formatUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { polygon } from 'wagmi/chains';

interface HistoryDataPoint {
  date: string;
  value: number;
}

export function usePortfolioValue() {
  const { address, isConnected } = useAccount();
  const { data: nativeBalance } = useBalance({
    address,
    chainId: polygon.id,
    watch: true,
  });
  const { balances, verifiedTokens, customTokens, walletTokens } = useTokenBalances();
  const { tokenData } = useTokenPrices();
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize all tokens
  const allTokens = useMemo(() => [
    ...verifiedTokens,
    ...customTokens,
    ...walletTokens
  ], [verifiedTokens, customTokens, walletTokens]);

  // Calculate total portfolio value
  useEffect(() => {
    if (!isConnected) {
      setTotalValue(0);
      setIsLoading(false);
      return;
    }

    let total = 0;

    // Add native MATIC balance
    if (nativeBalance && tokenData.MATIC) {
      const maticValue = Number(formatUnits(nativeBalance.value, 18)) * tokenData.MATIC.price;
      total += maticValue;
    }

    // Add all token balances
    allTokens.forEach(token => {
      const balance = balances[token.symbol];
      if (balance && tokenData[token.symbol]) {
        const formattedBalance = Number(formatUnits(balance, token.decimals));
        const price = tokenData[token.symbol].price;
        total += formattedBalance * price;
      }
    });

    setTotalValue(total || 1.00); // Set minimum value to 1.00 for demo purposes
    setIsLoading(false);
  }, [isConnected, nativeBalance, balances, tokenData, allTokens]);

  // Generate historical data based on time range
  const generateHistoricalData = useCallback((days: number): HistoryDataPoint[] => {
    const now = Date.now();
    const history: HistoryDataPoint[] = [];
    const dataPoints = days === 1 ? 24 : days;

    for (let i = dataPoints - 1; i >= 0; i--) {
      const timestamp = now - (i * (days === 1 ? 3600000 : 86400000));
      const date = new Date(timestamp);
      const formattedDate = days === 1 
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString();

      // Add some random variation to make the chart look more realistic
      const variation = 1 + (Math.sin(i) * 0.03) + (Math.random() * 0.02);
      history.push({
        date: formattedDate,
        value: Number((totalValue * variation).toFixed(2))
      });
    }

    return history;
  }, [totalValue]);

  return {
    totalValue,
    generateHistoricalData,
    isLoading,
    nativeBalance: nativeBalance?.formatted,
    nativeSymbol: nativeBalance?.symbol,
  };
}