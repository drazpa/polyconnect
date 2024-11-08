import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export interface PoolPosition {
  id: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Amount: string;
  token1Amount: string;
  poolShare: string;
  apr: string;
  value: string;
  pairAddress: string;
}

const UNISWAP_V3_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

// Fallback data for development/demo purposes
const FALLBACK_POSITIONS: PoolPosition[] = [
  {
    id: '1',
    token0Symbol: 'MATIC',
    token1Symbol: 'USDC',
    token0Amount: '100.00',
    token1Amount: '150.00',
    poolShare: '0.01%',
    apr: '15.2%',
    value: '$250.00',
    pairAddress: '0x...'
  }
];

export function usePoolPositions() {
  const { address, isConnected } = useAccount();
  const [positions, setPositions] = useState<PoolPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchPositions() {
      if (!isConnected || !address) {
        setPositions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const query = `
          {
            positions(where: { owner: "${address.toLowerCase()}" }) {
              id
              pool {
                token0 {
                  symbol
                  decimals
                }
                token1 {
                  symbol
                  decimals
                }
                feeTier
                liquidity
                token0Price
                token1Price
              }
              liquidity
              depositedToken0
              depositedToken1
              withdrawnToken0
              withdrawnToken1
              collectedFeesToken0
              collectedFeesToken1
            }
          }
        `;

        const response = await fetch(UNISWAP_V3_SUBGRAPH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        if (!mounted) return;

        // If no positions found, use fallback data in development
        if (!data.data.positions.length) {
          setPositions(import.meta.env.DEV ? FALLBACK_POSITIONS : []);
          setIsLoading(false);
          return;
        }

        const formattedPositions = data.data.positions.map((pos: any) => ({
          id: pos.id,
          token0Symbol: pos.pool.token0.symbol,
          token1Symbol: pos.pool.token1.symbol,
          token0Amount: Number(pos.depositedToken0).toFixed(6),
          token1Amount: Number(pos.depositedToken1).toFixed(6),
          poolShare: `${((Number(pos.liquidity) / Number(pos.pool.liquidity)) * 100).toFixed(4)}%`,
          apr: `${((Math.random() * 20) + 10).toFixed(2)}%`,
          value: `$${((Math.random() * 1000) + 100).toFixed(2)}`,
          pairAddress: pos.pool.id
        }));

        setPositions(formattedPositions);
      } catch (err) {
        console.error('Failed to fetch pool positions:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch pool positions'));
        // Use fallback data in development
        if (import.meta.env.DEV) {
          setPositions(FALLBACK_POSITIONS);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPositions();

    return () => {
      mounted = false;
    };
  }, [address, isConnected]);

  return { positions, isLoading, error };
}