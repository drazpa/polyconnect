import React from 'react';
import { useTransactionHistory } from '../hooks/useTransactionHistory';
import { useAccount } from 'wagmi';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw, 
  Loader2, 
  ExternalLink,
  Wallet,
  Clock
} from 'lucide-react';

export function WalletActivity() {
  const { isConnected } = useAccount();
  const { transactions, isLoading, error } = useTransactionHistory();

  if (!isConnected) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Wallet className="w-12 h-12 text-purple-400/50 mb-3" />
          <p className="text-gray-600">Connect your wallet to view transaction history</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-center py-8 space-x-3">
          <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
          <span className="text-gray-600">Loading transaction history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load transactions. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
          <p className="text-gray-600">No transactions found</p>
        </div>
      </div>
    );
  }

  const formatAddress = (addr: string) => 
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div 
          key={tx.hash} 
          className="glass-card rounded-xl p-4 hover:border-purple-300 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`
                p-2 rounded-lg 
                ${tx.type === 'send' ? 'bg-red-50 text-red-600' : 
                  tx.type === 'receive' ? 'bg-green-50 text-green-600' : 
                  'bg-blue-50 text-blue-600'}
              `}>
                {tx.type === 'send' && <ArrowUpRight className="w-5 h-5" />}
                {tx.type === 'receive' && <ArrowDownLeft className="w-5 h-5" />}
                {tx.type === 'swap' && <RefreshCcw className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{tx.amount}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">From: {formatAddress(tx.from)}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs">To: {formatAddress(tx.to)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{tx.timestamp}</p>
              <div className="flex items-center justify-end space-x-2 mt-1">
                {tx.tokenAddress && (
                  <a
                    href={`https://polygonscan.com/token/${tx.tokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:text-purple-700"
                  >
                    Token Info
                  </a>
                )}
                <span className="text-gray-400">•</span>
                <a
                  href={`https://polygonscan.com/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-xs text-purple-600 hover:text-purple-700"
                >
                  <span className="mr-1">View</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}