import React, { useState } from 'react';
import { XCircle, Search, AlertTriangle, Plus } from 'lucide-react';
import { usePublicClient } from 'wagmi';
import { TokenVerifier } from '../utils/TokenVerifier';
import { Token } from '../types/token';

interface Props {
  onClose: () => void;
  onAdd: (token: Token) => void;
  customTokens: Token[];
}

export function AddTokenModal({ onClose, onAdd, customTokens }: Props) {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenInfo, setTokenInfo] = useState<Token | null>(null);
  const publicClient = usePublicClient();

  const handleSearch = async () => {
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Please enter a valid token address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const verifier = new TokenVerifier(publicClient);
      const tokenAddress = address as `0x${string}`;
      const info = await verifier.getTokenInfo(tokenAddress);

      if (!info) {
        setError('Invalid token contract');
        return;
      }

      setTokenInfo(info);
    } catch (err) {
      setError('Failed to fetch token information');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = (token: Token) => {
    onAdd(token);
    setTokenInfo(null);
    setAddress('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="animate-in slide-in-from-bottom-4 duration-300 max-w-2xl w-full">
        <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-purple-800 text-transparent bg-clip-text">
              Add Custom Token
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Token Address Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Contract Address
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Token Info */}
            {tokenInfo && (
              <div className="space-y-3 p-4 bg-purple-50/50 rounded-lg border border-purple-100">
                <h4 className="text-lg font-medium text-gray-900">Token Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <span className="text-sm text-gray-600">Token Name</span>
                    <p className="text-sm font-medium text-gray-900">{tokenInfo.name}</p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <span className="text-sm text-gray-600">Symbol</span>
                    <p className="text-sm font-medium text-gray-900">{tokenInfo.symbol}</p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <span className="text-sm text-gray-600">Decimals</span>
                    <p className="text-sm font-medium text-gray-900">{tokenInfo.decimals}</p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <span className="text-sm text-gray-600">Contract</span>
                    <a 
                      href={`https://polygonscan.com/token/${tokenInfo.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      {tokenInfo.address.slice(0, 6)}...{tokenInfo.address.slice(-4)}
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => handleAdd(tokenInfo)}
                  className="w-full btn btn-primary mt-4"
                >
                  Add Token
                </button>
              </div>
            )}

            {/* Custom Tokens List */}
            {customTokens.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-lg font-medium text-gray-900">Custom Tokens</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {customTokens.map((token) => (
                    <div 
                      key={token.address}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-300 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{token.name}</p>
                        <p className="text-sm text-gray-600">{token.symbol}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <a
                          href={`https://polygonscan.com/token/${token.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:text-purple-700"
                        >
                          View
                        </a>
                        <button
                          onClick={() => handleAdd(token)}
                          className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}