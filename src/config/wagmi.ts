import { http, createConfig } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors';

// Multiple RPC endpoints with load balancing
const RPC_ENDPOINTS = [
  'https://polygon-rpc.com',
  'https://rpc-mainnet.matic.network',
  'https://matic-mainnet.chainstacklabs.com',
  'https://rpc-mainnet.maticvigil.com',
  'https://polygon-bor.publicnode.com',
];

let currentRpcIndex = 0;

function getNextRpcUrl() {
  const url = RPC_ENDPOINTS[currentRpcIndex];
  currentRpcIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length;
  return url;
}

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

if (!projectId) throw new Error('Missing VITE_WALLET_CONNECT_PROJECT_ID');

export const config = createConfig({
  chains: [polygon],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'PolyConnect',
      chainId: polygon.id,
    }),
    walletConnect({
      projectId,
      metadata: {
        name: 'PolyConnect',
        description: 'Track your digital assets on Polygon',
        url: window.location.origin,
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
    }),
  ],
  transports: {
    [polygon.id]: http(getNextRpcUrl(), {
      batch: {
        batchSize: 100,
        wait: 100,
      },
      fetchOptions: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
});