import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { erc20Abi } from 'viem';

interface Transaction {
  hash: string;
  type: 'send' | 'receive' | 'swap';
  amount: string;
  timestamp: string;
  status: 'confirmed' | 'pending';
  tokenSymbol?: string;
  tokenAddress?: string;
  from: string;
  to: string;
  value: bigint;
}

const BLOCKS_TO_FETCH = 1000n;
const CACHE_DURATION = 30_000; // 30 seconds

// Fallback data for development/demo purposes
const FALLBACK_TRANSACTIONS: Transaction[] = [
  {
    hash: '0x123...',
    type: 'send',
    amount: '100 MATIC',
    timestamp: new Date().toLocaleString(),
    status: 'confirmed',
    from: '0x1234...',
    to: '0x5678...',
    value: BigInt(100000000000000000)
  }
];

export function useTransactionHistory() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    async function fetchTransactions() {
      if (!isConnected || !address) {
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const blockNumber = await publicClient.getBlockNumber();
        const fromBlock = blockNumber - BLOCKS_TO_FETCH;

        // Get both native transfers and token transfers
        const [nativeTransfers, tokenTransfers] = await Promise.all([
          publicClient.getTransactions({
            address,
            fromBlock,
          }),
          publicClient.getLogs({
            event: {
              type: 'event',
              inputs: [
                { type: 'address', indexed: true, name: 'from' },
                { type: 'address', indexed: true, name: 'to' },
                { type: 'uint256', indexed: false, name: 'value' }
              ],
              name: 'Transfer'
            },
            fromBlock,
            args: {
              from: address,
              to: address,
            },
          })
        ]);

        if (!mounted) return;

        // If no transactions found, use fallback data in development
        if (!nativeTransfers.length && !tokenTransfers.length) {
          setTransactions(import.meta.env.DEV ? FALLBACK_TRANSACTIONS : []);
          setIsLoading(false);
          return;
        }

        // Process native transfers
        const nativeTxs = await Promise.all(
          nativeTransfers.map(async (tx) => {
            const type = tx.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive';
            const block = await publicClient.getBlock({ blockHash: tx.blockHash! });
            
            return {
              hash: tx.hash,
              type,
              amount: `${formatUnits(tx.value, 18)} MATIC`,
              timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
              status: 'confirmed' as const,
              from: tx.from,
              to: tx.to!,
              value: tx.value
            };
          })
        );

        // Process token transfers
        const tokenTxs = await Promise.all(
          tokenTransfers.map(async (log) => {
            try {
              const tokenContract = {
                address: log.address,
                abi: erc20Abi,
              };

              const [symbol, decimals] = await Promise.all([
                publicClient.readContract({
                  ...tokenContract,
                  functionName: 'symbol',
                }),
                publicClient.readContract({
                  ...tokenContract,
                  functionName: 'decimals',
                }),
              ]);

              const block = await publicClient.getBlock({ blockHash: log.blockHash });
              const type = log.args.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive';

              return {
                hash: log.transactionHash,
                type,
                amount: `${formatUnits(log.args.value || 0n, Number(decimals))} ${symbol}`,
                timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(),
                status: 'confirmed' as const,
                tokenSymbol: symbol as string,
                tokenAddress: log.address,
                from: log.args.from,
                to: log.args.to,
                value: log.args.value || 0n
              };
            } catch {
              return null;
            }
          })
        );

        if (!mounted) return;

        // Combine and sort all transactions
        const allTxs = [...nativeTxs, ...tokenTxs.filter((tx): tx is Transaction => tx !== null)]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setTransactions(allTxs);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch transactions'));
          // Use fallback data in development
          if (import.meta.env.DEV) {
            setTransactions(FALLBACK_TRANSACTIONS);
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchTransactions();
    
    // Poll for new transactions
    const poll = () => {
      timeoutId = setTimeout(() => {
        if (mounted) {
          fetchTransactions().finally(() => {
            if (mounted) poll();
          });
        }
      }, CACHE_DURATION);
    };
    
    poll();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [address, isConnected, publicClient]);

  return { transactions, isLoading, error };
}