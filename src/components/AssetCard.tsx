import React from 'react';
import { formatUnits } from 'viem';
import { ExternalLink, Send } from 'lucide-react';
import { Token } from '../types/token';

interface AssetCardProps {
  token: Token;
  balance: bigint;
  onClick?: () => void;
  onSend?: () => void;
}

export function AssetCard({ token, balance, onClick, onSend }: AssetCardProps) {
  const formattedBalance = formatUnits(balance, token.decimals);

  const getTradeUrl = (token: Token) => {
    const baseUrl = token.isCustom 
      ? 'https://app.uniswap.org/#/swap'
      : 'https://quickswap.exchange/#/swap';
    return `${baseUrl}?outputCurrency=${token.address}&chain=polygon`;
  };

  return (
    <div 
      onClick={onClick}
      className="glass-card rounded-xl p-6 purple-glow purple-glow-hover cursor-pointer relative group"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-800 text-transparent bg-clip-text">
            {token.symbol}
          </h3>
          <p className="text-sm text-gray-500">{token.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {!token.isNative && (
            <a
              href={`https://polygonscan.com/token/${token.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSend?.();
            }}
            className="text-purple-600 hover:text-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">
          {Number(formattedBalance).toLocaleString(undefined, { maximumFractionDigits: 6 })} {token.symbol}
        </p>
      </div>

      {!token.isNative && (
        <div className="mt-4 pt-4 border-t border-purple-100">
          <a
            href={getTradeUrl(token)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-purple-600 hover:text-purple-700"
            onClick={(e) => e.stopPropagation()}
          >
            Trade on {token.isCustom ? 'Uniswap' : 'QuickSwap'}
          </a>
        </div>
      )}
    </div>
  );
}