import React from 'react';
import { usePortfolioValue } from '../hooks/usePortfolioValue';
import { Wallet, DollarSign, PieChart } from 'lucide-react';
import { useAccount } from 'wagmi';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { formatUnits } from 'viem';
import { TokenDetailsModal } from './TokenDetailsModal';
import { useTokenPrices } from '../hooks/useTokenPrices';

const COLORS = ['#9333EA', '#A855F7', '#C084FC', '#E9D5FF'];

export function PortfolioSummary() {
  const { isConnected } = useAccount();
  const { totalValue, isLoading, nativeBalance, nativeSymbol } = usePortfolioValue();
  const { balances, walletTokens } = useTokenBalances();
  const { tokenData } = useTokenPrices();
  const [showNativeModal, setShowNativeModal] = React.useState(false);

  // Calculate portfolio distribution
  const portfolioData = React.useMemo(() => {
    if (!isConnected || isLoading) return [];

    const nativeValue = Number(nativeBalance || '0') * (tokenData['MATIC']?.price || 0);
    
    const tokenValues = walletTokens.map(token => ({
      name: token.symbol,
      value: Number(formatUnits(balances[token.symbol] || 0n, token.decimals)) * 
             (tokenData[token.symbol]?.price || 0)
    })).filter(item => item.value > 0);

    return [
      { name: 'MATIC', value: nativeValue },
      ...tokenValues
    ].sort((a, b) => b.value - a.value);
  }, [isConnected, isLoading, nativeBalance, walletTokens, balances, tokenData]);

  if (!isConnected) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Portfolio Value</h2>
          <Wallet className="w-6 h-6 text-gray-400" />
        </div>
        <p className="mt-2 text-sm text-gray-500">Connect your wallet to view your portfolio</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-purple-100 rounded w-1/3"></div>
          <div className="mt-4 h-8 bg-purple-100 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 rounded-lg shadow-lg border border-purple-500/20">
          <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-purple-600">
            ${payload[0].value.toFixed(2)} ({((payload[0].value / totalValue) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="space-y-6">
        {/* Total Portfolio Value */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-purple-800 text-transparent bg-clip-text">
              Portfolio Value
            </h2>
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <p className="mt-4 text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 text-transparent bg-clip-text">
            ${totalValue.toLocaleString(undefined, { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-purple-100"></div>

        {/* Native Token Balance */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-700">Native Balance</h3>
            <Wallet className="w-5 h-5 text-purple-500" />
          </div>
          <button
            onClick={() => setShowNativeModal(true)}
            className="mt-2 w-full text-left hover:bg-purple-50 rounded-lg p-2 transition-colors"
          >
            <p className="text-2xl font-semibold text-gray-900">
              {nativeBalance} {nativeSymbol}
            </p>
            <p className="text-sm text-purple-600">
              ${(Number(nativeBalance) * (tokenData['MATIC']?.price || 0)).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </button>
        </div>

        {/* Portfolio Distribution */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Distribution</h3>
            <PieChart className="w-5 h-5 text-purple-500" />
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={portfolioData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {portfolioData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {portfolioData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
                <span className="text-sm text-gray-900">
                  {((entry.value / totalValue) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Native Token Modal */}
      {showNativeModal && (
        <TokenDetailsModal
          token={{
            symbol: 'MATIC',
            name: 'Polygon',
            decimals: 18,
            isNative: true,
            coingeckoId: 'matic-network',
          }}
          balance={balances.MATIC || 0n}
          price={tokenData['MATIC']?.price || 0}
          change24h={tokenData['MATIC']?.change24h || 0}
          marketCap={tokenData['MATIC']?.marketCap}
          volume24h={tokenData['MATIC']?.volume24h}
          onClose={() => setShowNativeModal(false)}
        />
      )}
    </div>
  );
}