import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Token } from '../types/token';

const STORAGE_PREFIX = 'polyconnect_v1_';
const GLOBAL_KEY = `${STORAGE_PREFIX}global`;

interface WalletStorage {
  verifiedTokens: Token[];
  customTokens: Token[];
  lastConnected: number;
}

const defaultStorage: WalletStorage = {
  verifiedTokens: [],
  customTokens: [],
  lastConnected: Date.now()
};

export function useWalletStorage() {
  const { address } = useAccount();

  const getStorageKey = useCallback((addr?: string) => {
    if (addr) {
      return `${STORAGE_PREFIX}wallet_${addr.toLowerCase()}`;
    }
    return GLOBAL_KEY;
  }, []);

  const getWalletData = useCallback((): WalletStorage => {
    try {
      // Always load global data first
      const globalData = localStorage.getItem(GLOBAL_KEY);
      const globalStorage: WalletStorage = globalData 
        ? JSON.parse(globalData)
        : defaultStorage;

      // If no address, return global data
      if (!address) {
        return globalStorage;
      }

      // Load wallet-specific data
      const walletKey = getStorageKey(address);
      const walletData = localStorage.getItem(walletKey);
      const walletStorage: WalletStorage = walletData 
        ? JSON.parse(walletData)
        : defaultStorage;

      // Merge global and wallet data, removing duplicates
      const mergedTokens = {
        verifiedTokens: [
          ...walletStorage.verifiedTokens,
          ...globalStorage.verifiedTokens.filter(gt => 
            !walletStorage.verifiedTokens.some(wt => 
              wt.address.toLowerCase() === gt.address.toLowerCase()
            )
          )
        ],
        customTokens: [
          ...walletStorage.customTokens,
          ...globalStorage.customTokens.filter(gt =>
            !walletStorage.customTokens.some(wt =>
              wt.address.toLowerCase() === gt.address.toLowerCase()
            )
          )
        ],
        lastConnected: Date.now()
      };

      return mergedTokens;
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      return defaultStorage;
    }
  }, [address, getStorageKey]);

  const saveWalletData = useCallback((data: Partial<WalletStorage>) => {
    try {
      const currentData = getWalletData();
      const newData: WalletStorage = {
        ...currentData,
        ...data,
        lastConnected: Date.now()
      };

      // Always save to global storage
      localStorage.setItem(GLOBAL_KEY, JSON.stringify(newData));

      // If connected, also save to wallet-specific storage
      if (address) {
        const walletKey = getStorageKey(address);
        localStorage.setItem(walletKey, JSON.stringify(newData));
      }

      // Trigger storage event for cross-tab synchronization
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Failed to save wallet data:', error);
    }
  }, [address, getStorageKey, getWalletData]);

  const clearWalletData = useCallback(() => {
    try {
      if (address) {
        const walletKey = getStorageKey(address);
        const walletData = getWalletData();
        
        // Keep custom tokens in global storage
        localStorage.setItem(GLOBAL_KEY, JSON.stringify({
          ...defaultStorage,
          customTokens: walletData.customTokens
        }));
        
        // Remove wallet-specific data
        localStorage.removeItem(walletKey);
      }
    } catch (error) {
      console.error('Failed to clear wallet data:', error);
    }
  }, [address, getStorageKey, getWalletData]);

  // Clean up old wallet data (older than 30 days)
  const cleanupOldData = useCallback(() => {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX) && key !== GLOBAL_KEY) {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (Date.now() - (data.lastConnected || 0) > THIRTY_DAYS) {
            // Move custom tokens to global storage before removing
            const globalData = JSON.parse(localStorage.getItem(GLOBAL_KEY) || '{}');
            globalData.customTokens = [
              ...(globalData.customTokens || []),
              ...(data.customTokens || [])
            ];
            localStorage.setItem(GLOBAL_KEY, JSON.stringify(globalData));
            
            // Remove old wallet data
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Failed to clean up old wallet data:', error);
    }
  }, []);

  return {
    getWalletData,
    saveWalletData,
    clearWalletData,
    cleanupOldData
  };
}