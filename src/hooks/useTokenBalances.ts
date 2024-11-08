import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useBalance, useReadContracts, usePublicClient } from 'wagmi';
import { erc20Abi } from 'viem';
import { polygon } from 'wagmi/chains';
import { Token } from '../types/token';
import { useWalletStorage } from './useWalletStorage';
import { TokenVerifier } from '../utils/TokenVerifier';

const CACHE_DURATION = 30_000; // 30 seconds
const BATCH_SIZE = 50; // Increased batch size for faster loading
const MAX_RETRIES = 3;
const POLLING_INTERVAL = 60_000; // Poll every minute instead of every 15 seconds

export function useTokenBalances() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [verifiedTokens, setVerifiedTokens] = useState<Token[]>([]);
  const [customTokens, setCustomTokens] = useState<Token[]>([]);
  const [walletTokens, setWalletTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getWalletData, saveWalletData } = useWalletStorage();
  const loadingRef = useRef(false);
  const lastFetchRef = useRef<number>(0);

  // Get native token balance
  const { data: nativeBalance } = useBalance({
    address,
    chainId: polygon.id,
    enabled: isConnected,
    watch: true,
    cacheTime: CACHE_DURATION,
  });

  // Load tokens from storage and detect wallet tokens
  useEffect(() => {
    let mounted = true;
    let detectionTimeout: NodeJS.Timeout;

    const detectWalletTokens = async () => {
      if (!isConnected || !address || !publicClient || loadingRef.current) return;
      
      const now = Date.now();
      if (now - lastFetchRef.current < CACHE_DURATION) return;
      
      try {
        loadingRef.current = true;
        lastFetchRef.current = now;

        const verifier = new TokenVerifier(publicClient);
        const { verifiedTokens: detected } = await verifier.detectAndVerifyTokens(address);

        if (!mounted) return;

        // Update wallet tokens, removing any that are already in verified or custom lists
        setWalletTokens(prev => {
          const newTokens = detected.filter(token => 
            !verifiedTokens.some(t => t.address?.toLowerCase() === token.address?.toLowerCase()) &&
            !customTokens.some(t => t.address?.toLowerCase() === token.address?.toLowerCase()) &&
            !prev.some(t => t.address?.toLowerCase() === token.address?.toLowerCase())
          );
          return [...prev, ...newTokens];
        });

        // Mark as not loading after initial detection
        setIsLoading(false);
      } catch (error) {
        console.error('Error detecting wallet tokens:', error);
        setIsLoading(false);
      } finally {
        loadingRef.current = false;
      }
    };

    // Initial detection
    detectWalletTokens();

    // Set up polling with longer interval
    if (isConnected) {
      detectionTimeout = setInterval(detectWalletTokens, POLLING_INTERVAL);
    }

    return () => {
      mounted = false;
      clearInterval(detectionTimeout);
    };
  }, [address, isConnected, publicClient, verifiedTokens, customTokens]);

  // Get all token balances in larger batches
  const allTokens = [...verifiedTokens, ...customTokens, ...walletTokens];
  
  const { data: tokenBalances } = useReadContracts({
    contracts: allTokens.map(token => ({
      address: token.address as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
      chainId: polygon.id,
    })),
    query: {
      enabled: Boolean(address) && isConnected && allTokens.length > 0,
      staleTime: CACHE_DURATION,
      cacheTime: CACHE_DURATION,
      retry: MAX_RETRIES,
      retryDelay: 1000,
      // Batch requests for faster loading
      batch: {
        multicall: true,
        batchSize: BATCH_SIZE,
      },
    },
  });

  // Create balances object
  const balances = {
    MATIC: nativeBalance?.value || 0n,
    ...Object.fromEntries(
      allTokens.map((token, index) => [
        token.symbol,
        tokenBalances?.[index]?.result || 0n,
      ])
    ),
  };

  const addVerifiedToken = useCallback((token: Token) => {
    setVerifiedTokens(prev => {
      if (prev.some(t => t.address?.toLowerCase() === token.address?.toLowerCase())) {
        return prev;
      }
      return [...prev, { ...token, isVerified: true }];
    });
  }, []);

  const addCustomToken = useCallback((token: Token) => {
    setCustomTokens(prev => {
      if (prev.some(t => t.address?.toLowerCase() === token.address?.toLowerCase())) {
        return prev;
      }
      return [...prev, { ...token, isCustom: true }];
    });
  }, []);

  return {
    isConnected,
    balances,
    verifiedTokens,
    customTokens,
    walletTokens,
    isLoading,
    addVerifiedToken,
    addCustomToken,
  };
}