import React, { useState } from 'react';
import { XCircle, Send, AlertTriangle, Check } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { Token } from '../types/token';
import { erc20Abi } from 'viem';

interface Props {
  token: Token;
  balance: bigint;
  onClose: () => void;
}

export function SendTokenModal({ token, balance, onClose }: Props) {
  const { address } = useAccount();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSend = async () => {
    try {
      setError(null);

      if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
        setError('Please enter a valid wallet address');
        return;
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      const parsedAmount = parseUnits(amount, token.decimals);
      if (parsedAmount > balance) {
        setError('Insufficient balance');
        return;
      }

      if (token.isNative) {
        writeContract({
          abi: [{
            type: 'function',
            name: 'send',
            inputs: [],
            outputs: [],
            stateMutability: 'payable'
          }],
          address: recipient as `0x${string}`,
          functionName: 'send',
          value: parsedAmount
        });
      } else {
        writeContract({
          abi: erc20Abi,
          address: token.address as `0x${string}`,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, parsedAmount]
        });
      }
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
    }
  };

  const formattedBalance = formatUnits(balance, token.decimals);

  React.useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="animate-in slide-in-from-bottom-4 duration-300 max-w-md w-full">
        <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-purple-800 text-transparent bg-clip-text">
              Send {token.symbol}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              disabled={isPending || isConfirming}
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Balance
              </label>
              <div className="text-lg font-semibold text-gray-900">
                {Number(formattedBalance).toLocaleString()} {token.symbol}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                disabled={isPending || isConfirming}
              />
            </div>

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
                  disabled={isPending || isConfirming}
                />
                <button
                  onClick={() => setAmount(formattedBalance)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-purple-600 hover:text-purple-700"
                  disabled={isPending || isConfirming}
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

            {isSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                <Check className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-green-600">Transaction successful!</p>
                  <a
                    href={`https://polygonscan.com/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:text-purple-700 mt-1 inline-flex items-center gap-1"
                  >
                    View on Explorer
                    <XCircle className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={isPending || isConfirming || !recipient || !amount}
              className="w-full btn btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isConfirming ? 'Confirming...' : 'Sending...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Send {token.symbol}
                </span>
              )}
            </button>

            {(isPending || isConfirming) && (
              <p className="text-center text-sm text-gray-500">
                Please wait while your transaction is being processed...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}