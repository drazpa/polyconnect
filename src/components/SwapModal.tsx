import React, { useState } from 'react';
import { XCircle, ArrowDownUp, AlertTriangle, Check } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { Token } from '../types/token';
import { erc20Abi } from 'viem';

interface Props {
  tokens: Token[];
  balances: { [key: string]: bigint };
  onClose: () => void;
}

export function SwapModal({ tokens, balances, onClose }: Props) {
  const { address } = useAccount();
  const [fromToken, setFromToken] = useState<Token>(tokens[0]);
  const [toToken, setToToken] = useState<Token>(tokens[1]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSwap = async () => {
    try {
      setError(null);

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      const parsedAmount = parseUnits(amount, fromToken.decimals);
      if (parsedAmount > (balances[fromToken.symbol] || 0n)) {
        setError('Insufficient balance');
        return;
      }

      // For demo purposes, redirect to Uniswap
      window.open(`https://app.uniswap.org/#/swap?inputCurrency=${fromToken.address}&outputCurrency=${toToken.address}&chain=polygon`, '_blank');
      onClose();
    } catch (err) {
      console.error('Swap error:', err);
      setError(err instanceof Error ? err.message : 'Swap failed');
    }
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmount('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="animate-in slide-in-from-bottom-4 duration-300 max-w-md w-full">
        <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-purple-800 text-transparent bg-clip-text">
              Swap Tokens
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* From Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <select
                value={fromToken.symbol}
                onChange={(e) => setFromToken(tokens.find(t => t.symbol === e.target.value)!)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {tokens.map(token => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol} - Balance: {formatUnits(balances[token.symbol] || 0n, token.decimals)}
                  </option>
                ))}
              </select>
            </div>

            {/* Switch Button */}
            <div className="flex justify-center">
              <button
                onClick={switchTokens}
                className="p-2 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
              >
                <ArrowDownUp className="w-5 h-5" />
              </button>
            </div>

            {/* To Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <select
                value={toToken.symbol}
                onChange={(e) => setToToken(tokens.find(t => t.symbol === e.target.value)!)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {tokens.map(token => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <button
                  onClick={() => setAmount(formatUnits(balances[fromToken.symbol] || 0n, fromToken.decimals))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-purple-600 hover:text-purple-700"
                >
                  MAX
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleSwap}
              disabled={!amount || fromToken.symbol === toToken.symbol}
              className="w-full btn btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ArrowDownUp className="w-4 h-4" />
                  Swap on Uniswap
                </span>
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              You will be redirected to Uniswap to complete the swap
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}