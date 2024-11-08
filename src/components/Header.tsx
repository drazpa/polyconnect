import React, { useState, useRef, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet, ChevronDown, LogOut, ExternalLink, RefreshCw, ArrowDownUp, CreditCard } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useWalletStorage } from '../hooks/useWalletStorage';

export function Header() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { clearWalletData } = useWalletStorage();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries();
      await new Promise(resolve => setTimeout(resolve, 750));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisconnect = () => {
    if (clearWalletData) {
      clearWalletData();
    }
    disconnect();
    setIsDropdownOpen(false);
  };

  const formatAddress = (addr: string) => 
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <header className="bg-white border-b border-purple-100 sticky top-0 z-50 backdrop-blur-lg bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="relative">
              <div className="absolute -inset-1 bg-purple-500 rounded-full blur-md opacity-10"></div>
              <Wallet className="relative w-8 h-8 text-purple-600" />
            </div>
            <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 text-transparent bg-clip-text">
              PolyConnect
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isConnected && (
              <>
                <a
                  href="https://app.polytrade.finance/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Purchase POLYX
                </a>
                <a
                  href="https://app.polytrade.finance/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Purchase USDM
                </a>
                <a
                  href="https://app.uniswap.org/#/swap?chain=polygon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary flex items-center gap-2"
                >
                  <ArrowDownUp className="w-4 h-4" />
                  Swap on Uniswap
                </a>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </>
            )}

            <div className="relative" ref={dropdownRef}>
              {isConnected ? (
                <>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="btn btn-primary glow-effect flex items-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{formatAddress(address!)}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 border border-purple-100 animate-in slide-in-from-top-2 duration-200">
                      <div className="py-1">
                        <a
                          href={`https://polygonscan.com/address/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View on Explorer
                        </a>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleDisconnect}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => connect({ connector: connectors[0] })}
                  className="btn btn-primary glow-effect flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>

        {connectError && (
          <div className="fixed bottom-4 right-4 max-w-sm bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg animate-in slide-in-from-right-2 duration-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                <p className="mt-1 text-sm text-red-600">{connectError.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}