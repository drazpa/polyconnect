import { useState, useEffect, useCallback } from 'react';

interface TokenData {
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

interface TokenPrices {
  [key: string]: TokenData;
}

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION = 120000; // 2 minutes
const RETRY_DELAY = 5000; // 5 seconds
const MAX_RETRIES = 3;

// Maintain a global cache
let priceCache: { data: TokenPrices; timestamp: number } | null = null;
let lastFetchTimestamp = 0;
const MIN_FETCH_INTERVAL = 10000; // 10 seconds minimum between fetches

const FALLBACK_DATA: TokenPrices = {
  MATIC: {
    price: 1.00,
    change24h: 0,
    marketCap: 1000000000,
    volume24h: 100000000,
  },
  POL: {
    price: 1.00,
    change24h: 0,
    marketCap: 1000000000,
    volume24h: 100000000,
  },
  USDT: {
    price: 1.00,
    change24h: 0,
    marketCap: 1000000000,
    volume24h: 100000000,
  },
  USDC: {
    price: 1.00,
    change24h: 0,
    marketCap: 1000000000,
    volume24h: 100000000,
  }
};

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  const now = Date.now();
  const timeElapsed = now - lastFetchTimestamp;
  
  if (timeElapsed < MIN_FETCH_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_FETCH_INTERVAL - timeElapsed));
  }

  for (let i = 0; i < retries; i++) {
    try {
      lastFetchTimestamp = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) return response;
      
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '60', 10);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Request timeout, retrying...');
        continue;
      }
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries reached');
}

export function useTokenPrices() {
  const [tokenData, setTokenData] = useState<TokenPrices>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      // Check cache first
      if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
        setTokenData(priceCache.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        ids: 'matic-network,tether,usd-coin',
        vs_currencies: 'usd',
        include_24hr_vol: 'true',
        include_24hr_change: 'true',
        include_market_cap: 'true',
        precision: '4'
      });

      const response = await fetchWithRetry(
        `${COINGECKO_API_BASE}/simple/price?${params}`
      );
      
      const data = await response.json();
      
      const newTokenData: TokenPrices = {
        MATIC: {
          price: data['matic-network']?.usd || FALLBACK_DATA.MATIC.price,
          change24h: data['matic-network']?.usd_24h_change || 0,
          marketCap: data['matic-network']?.usd_market_cap || FALLBACK_DATA.MATIC.marketCap,
          volume24h: data['matic-network']?.usd_24h_vol || FALLBACK_DATA.MATIC.volume24h,
        },
        POL: {
          price: data['matic-network']?.usd || FALLBACK_DATA.POL.price,
          change24h: data['matic-network']?.usd_24h_change || 0,
          marketCap: data['matic-network']?.usd_market_cap || FALLBACK_DATA.POL.marketCap,
          volume24h: data['matic-network']?.usd_24h_vol || FALLBACK_DATA.POL.volume24h,
        },
        USDT: {
          price: data['tether']?.usd || FALLBACK_DATA.USDT.price,
          change24h: data['tether']?.usd_24h_change || 0,
          marketCap: data['tether']?.usd_market_cap || FALLBACK_DATA.USDT.marketCap,
          volume24h: data['tether']?.usd_24h_vol || FALLBACK_DATA.USDT.volume24h,
        },
        USDC: {
          price: data['usd-coin']?.usd || FALLBACK_DATA.USDC.price,
          change24h: data['usd-coin']?.usd_24h_change || 0,
          marketCap: data['usd-coin']?.usd_market_cap || FALLBACK_DATA.USDC.marketCap,
          volume24h: data['usd-coin']?.usd_24h_vol || FALLBACK_DATA.USDC.volume24h,
        }
      };

      // Update cache
      priceCache = {
        data: newTokenData,
        timestamp: Date.now()
      };

      setTokenData(newTokenData);
      setLoading(false);
    } catch (error) {
      console.warn('Failed to fetch token prices:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch prices'));
      setLoading(false);
      
      // Use cached data if available, otherwise use fallback data
      setTokenData(priceCache?.data || FALLBACK_DATA);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initFetch = async () => {
      if (!mounted) return;
      await fetchPrices();
    };

    initFetch();

    // Set up polling with exponential backoff on error
    const poll = () => {
      if (!mounted) return;
      timeoutId = setTimeout(() => {
        if (mounted) {
          fetchPrices().finally(() => {
            if (mounted) poll();
          });
        }
      }, error ? Math.min(CACHE_DURATION * 2, 300000) : CACHE_DURATION);
    };
    
    poll();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [fetchPrices, error]);

  return { tokenData, loading, error };
}