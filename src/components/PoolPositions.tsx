import React from 'react';
import { usePoolPositions } from '../hooks/usePoolPositions';
import { ExternalLink, Loader2, Wallet, TrendingUp } from 'lucide-react';

export function PoolPositions() {
  const { positions, isLoading, error } = usePoolPositions();

  if (!positions.length && !isLoading) {
    return (
      <div className="text-center py-12">
        <Wallet className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
        <p className="text-gray-600">No Uniswap V3 positions found</p>
        <a
          href="https://app.uniswap.org/#/pools?chain=polygon"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-700"
        >
          Add liquidity on Uniswap
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load pool positions. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {positions.map((position) => (
        <div
          key={position.id}
          className="glass-card rounded-xl p-6 hover:border-purple-300 transition-all duration-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pair Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {position.token0Symbol}/{position.token1Symbol}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <a
                  href={`https://polygonscan.com/address/${position.pairAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  View Pool
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Position Size */}
            <div>
              <div className="text-sm text-gray-600">Position Size</div>
              <div className="mt-1">
                <div className="text-sm text-gray-900">{position.token0Amount} {position.token0Symbol}</div>
                <div className="text-sm text-gray-900">{position.token1Amount} {position.token1Symbol}</div>
              </div>
            </div>

            {/* Pool Share & APR */}
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600">Pool Share</div>
                <span className="text-sm font-medium text-gray-900">{position.poolShare}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">APR: {position.apr}</span>
              </div>
            </div>

            {/* Value */}
            <div className="text-right">
              <div className="text-sm text-gray-600">Value</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{position.value}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3">
            <a
              href={`https://app.uniswap.org/#/pools/${position.id}?chain=polygon`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-purple-50 text-purple-600 hover:bg-purple-100"
            >
              Manage Position
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}