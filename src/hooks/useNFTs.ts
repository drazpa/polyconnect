import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export interface NFT {
  id: string;
  name: string;
  description?: string;
  image: string;
  contractAddress: string;
  tokenId: string;
  collectionName?: string;
}

const ALCHEMY_API_KEY = 'demo'; // Replace with your Alchemy API key
const ALCHEMY_BASE_URL = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

export function useNFTs() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchNFTs() {
      if (!isConnected || !address) {
        setNfts([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${ALCHEMY_BASE_URL}/getNFTs/?owner=${address}`);
        const data = await response.json();

        const formattedNFTs: NFT[] = data.ownedNfts.map((nft: any) => ({
          id: `${nft.contract.address}-${nft.id.tokenId}`,
          name: nft.title || 'Unnamed NFT',
          description: nft.description,
          image: nft.media[0]?.gateway || nft.metadata?.image || '',
          contractAddress: nft.contract.address,
          tokenId: nft.id.tokenId,
          collectionName: nft.contract.name
        }));

        setNfts(formattedNFTs);
      } catch (err) {
        console.error('Failed to fetch NFTs:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch NFTs'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchNFTs();
  }, [address, isConnected]);

  return { nfts, isLoading, error };
}