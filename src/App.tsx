import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/wagmi';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { PortfolioSummary } from './components/PortfolioSummary';
import { PortfolioChart } from './components/PortfolioChart';
import { CoinList } from './components/CoinList';

const queryClient = new QueryClient();

function Dashboard() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <PortfolioChart />
                <div className="glass-card rounded-xl p-6">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-purple-800 text-transparent bg-clip-text mb-4">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <a
                      href="https://wallet.polygon.technology/polygon/bridge"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card p-4 rounded-lg hover:border-purple-300 transition-all duration-200 text-center"
                    >
                      <p className="font-medium text-gray-900">Bridge</p>
                      <p className="text-sm text-gray-600">Transfer Assets</p>
                    </a>
                    <a
                      href="https://app.uniswap.org/#/swap?chain=polygon"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card p-4 rounded-lg hover:border-purple-300 transition-all duration-200 text-center"
                    >
                      <p className="font-medium text-gray-900">Swap</p>
                      <p className="text-sm text-gray-600">Trade Tokens</p>
                    </a>
                    <a
                      href="https://app.uniswap.org/#/pool?chain=polygon"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card p-4 rounded-lg hover:border-purple-300 transition-all duration-200 text-center"
                    >
                      <p className="font-medium text-gray-900">Pool</p>
                      <p className="text-sm text-gray-600">Add Liquidity</p>
                    </a>
                    <a
                      href="https://polygonscan.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card p-4 rounded-lg hover:border-purple-300 transition-all duration-200 text-center"
                    >
                      <p className="font-medium text-gray-900">Explorer</p>
                      <p className="text-sm text-gray-600">View Transactions</p>
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <PortfolioSummary />
              </div>
            </div>
            
            <div className="card p-6">
              <CoinList type="detected" />
            </div>
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;