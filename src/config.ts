import { createConfig, http } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';

export const walletConnectProjectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

if (!walletConnectProjectId) throw new Error('Missing VITE_WALLET_CONNECT_PROJECT_ID');

export const wagmiConfig = defaultWagmiConfig({
  chains: [polygon],
  projectId: walletConnectProjectId,
  metadata: {
    name: 'Web3 Portfolio Dashboard',
    description: 'Track your digital assets on Polygon',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
  },
});