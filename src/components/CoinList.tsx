import React, { useState, useMemo } from 'react';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { TokenDetailsModal } from './TokenDetailsModal';
import { TokenVerificationModal } from './TokenVerificationModal';
import { AddTokenModal } from './AddTokenModal';
import { SendTokenModal } from './SendTokenModal';
import { Loader2, Plus, Star, StarOff, Eye, EyeOff, Search, Coins, Send, ArrowUpDown } from 'lucide-react';
import { Token } from '../types/token';
import { useTokenPrices } from '../hooks/useTokenPrices';
import { formatUnits } from 'viem';
import { NFTGallery } from './NFTGallery';
import { PoolPositions } from './PoolPositions';

type SortOption = 'balance' | 'name' | 'value' | 'recent';

interface CoinListProps {
  type: 'detected';
}

export function CoinList({ type }: CoinListProps) {
  const { 
    balances, 
    walletTokens,
    isConnected, 
    isLoading,
    addCustomToken,
  } = useTokenBalances();
  const { tokenData } = useTokenPrices();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [sendingToken, setSendingToken] = useState<Token | null>(null);
  const [showAddToken, setShowAddToken] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState<Token | null>(null);
  const [showZeroBalances, setShowZeroBalances] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('balance');
  const [activeSection, setActiveSection] = useState<'tokens' | 'nfts' | 'liquidity'>('tokens');

  // Filter and sort tokens
  const displayTokens = useMemo(() => {
    if (!isConnected) return [];
    
    const filtered = walletTokens
      .filter(token => {
        const hasBalance = balances[token.symbol] && balances[token.symbol] > 0n;
        const matchesSearch = token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            token.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch && (showZeroBalances || hasBalance);
      });

    return filtered.sort((a, b) => {
      // Always prioritize favorites
      const aFav = favorites.has(a.address);
      const bFav = favorites.has(b.address);
      if (aFav !== bFav) return bFav ? 1 : -1;

      // Then apply selected sort
      switch (sortBy) {
        case 'balance': {
          const aBalance = balances[a.symbol] || 0n;
          const bBalance = balances[b.symbol] || 0n;
          return bBalance > aBalance ? 1 : -1;
        }
        case 'name':
          return a.name.localeCompare(b.name);
        case 'value': {
          const aBalance = Number(formatUnits(balances[a.symbol] || 0n, a.decimals));
          const bBalance = Number(formatUnits(balances[b.symbol] || 0n, b.decimals));
          const aValue = aBalance * (tokenData[a.symbol]?.price || 0);
          const bValue = bBalance * (tokenData[b.symbol]?.price || 0);
          return bValue - aValue;
        }
        case 'recent':
          return walletTokens.indexOf(b) - walletTokens.indexOf(a);
        default:
          return 0;
      }
    });
  }, [walletTokens, balances, searchQuery, showZeroBalances, favorites, sortBy, isConnected, tokenData]);

  const toggleFavorite = (address: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(address)) {
        next.delete(address);
      } else {
        next.add(address);
      }
      return next;
    });
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Coins className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
        <p className="text-gray-500">Connect your wallet to view your assets</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 text-transparent bg-clip-text flex items-center gap-2">
              <Coins className="w-7 h-7 text-purple-600" />
              Your Assets
            </h2>
            <p className="mt-1 text-gray-600">Manage your tokens and digital assets</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-purple-50 rounded-lg p-1">
              <button
                onClick={() => setActiveSection('tokens')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === 'tokens' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Tokens
              </button>
              <button
                onClick={() => setActiveSection('nfts')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === 'nfts' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                NFTs
              </button>
              <button
                onClick={() => setActiveSection('liquidity')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === 'liquidity' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Liquidity
              </button>
            </div>
            {activeSection === 'tokens' && (
              <>
                <button
                  onClick={() => setShowZeroBalances(!showZeroBalances)}
                  className="btn bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center gap-2"
                >
                  {showZeroBalances ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide Zero
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Show All
                    </>
                  )}
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="btn bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center gap-2 pr-8"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%237C3AED' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="balance">Sort by Balance</option>
                  <option value="value">Sort by Value</option>
                  <option value="name">Sort by Name</option>
                  <option value="recent">Sort by Recent</option>
                </select>
                <button
                  onClick={() => setShowAddToken(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Token
                </button>
              </>
            )}
          </div>
        </div>

        {activeSection === 'tokens' && (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Token List */}
            <div className="bg-white rounded-xl border border-purple-100 divide-y divide-purple-100">
              {displayTokens.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No tokens found</p>
                </div>
              ) : (
                displayTokens.map((token) => {
                  const balance = balances[token.symbol] || 0n;
                  const formattedBalance = formatUnits(balance, token.decimals);
                  const usdValue = Number(formattedBalance) * (tokenData[token.symbol]?.price || 0);
                  const isFavorite = favorites.has(token.address);

                  return (
                    <div
                      key={token.address}
                      className="p-4 hover:bg-purple-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(token.address);
                            }}
                            className={`p-1 rounded-full transition-colors ${
                              isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-500'
                            }`}
                          >
                            {isFavorite ? <Star className="w-5 h-5" /> : <StarOff className="w-5 h-5" />}
                          </button>
                          <div 
                            className="cursor-pointer"
                            onClick={() => setSelectedToken(token)}
                          >
                            <h3 className="font-medium text-gray-900">{token.symbol}</h3>
                            <p className="text-sm text-gray-500">{token.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {Number(formattedBalance).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                            </p>
                            <p className="text-sm text-gray-500">
                              ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          <button
                            onClick={() => setSendingToken(token)}
                            className="p-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                            title={`Send ${token.symbol}`}
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {activeSection === 'nfts' && <NFTGallery />}
        {activeSection === 'liquidity' && <PoolPositions />}
      </div>

      {/* Modals */}
      {selectedToken && (
        <TokenDetailsModal
          token={selectedToken}
          balance={balances[selectedToken.symbol] || 0n}
          price={tokenData[selectedToken.symbol]?.price || 0}
          change24h={tokenData[selectedToken.symbol]?.change24h || 0}
          marketCap={tokenData[selectedToken.symbol]?.marketCap}
          volume24h={tokenData[selectedToken.symbol]?.volume24h}
          onClose={() => setSelectedToken(null)}
          onVerify={undefined}
        />
      )}

      {sendingToken && (
        <SendTokenModal
          token={sendingToken}
          balance={balances[sendingToken.symbol] || 0n}
          onClose={() => setSendingToken(null)}
        />
      )}

      {verifyingToken && (
        <TokenVerificationModal
          token={verifyingToken}
          onClose={() => setVerifyingToken(null)}
          onVerify={(token) => {
            addCustomToken(token);
            setVerifyingToken(null);
          }}
        />
      )}

      {showAddToken && (
        <AddTokenModal
          onClose={() => setShowAddToken(false)}
          onAdd={(token) => {
            addCustomToken(token);
            setShowAddToken(false);
          }}
          customTokens={displayTokens}
        />
      )}
    </>
  );
}