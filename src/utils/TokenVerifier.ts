import { PublicClient } from 'wagmi';
import { erc20Abi } from 'viem';
import { Token } from '../types/token';

const BATCH_SIZE = 10; // Process in smaller batches
const CACHE_DURATION = 30_000; // 30 seconds
const MAX_RETRIES = 3;

export class TokenVerifier {
  private client: PublicClient;
  
  constructor(client: PublicClient) {
    this.client = client;
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    retries = MAX_RETRIES
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Max retries reached');
  }

  async getTokenInfo(address: `0x${string}`): Promise<Token | null> {
    try {
      const [symbol, name, decimals] = await Promise.all([
        this.retryOperation(() => 
          this.client.readContract({
            address,
            abi: erc20Abi,
            functionName: 'symbol',
          })
        ),
        this.retryOperation(() => 
          this.client.readContract({
            address,
            abi: erc20Abi,
            functionName: 'name',
          })
        ),
        this.retryOperation(() => 
          this.client.readContract({
            address,
            abi: erc20Abi,
            functionName: 'decimals',
          })
        ),
      ]);

      return {
        symbol: symbol as string,
        name: name as string,
        address,
        decimals: Number(decimals),
        isDetected: true,
      };
    } catch {
      return null;
    }
  }

  async detectTokens(walletAddress: `0x${string}`): Promise<Token[]> {
    try {
      // Get recent token transfer events
      const logs = await this.client.getLogs({
        event: {
          type: 'event',
          inputs: [
            { type: 'address', indexed: true, name: 'from' },
            { type: 'address', indexed: true, name: 'to' },
            { type: 'uint256', indexed: false, name: 'value' }
          ],
          name: 'Transfer'
        },
        args: {
          to: walletAddress
        },
        fromBlock: 'earliest'
      });

      // Get unique token addresses
      const uniqueAddresses = new Set<`0x${string}`>(
        logs.map(log => log.address.toLowerCase() as `0x${string}`)
      );

      const tokens: Token[] = [];
      const addresses = Array.from(uniqueAddresses);

      // Process in batches
      for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
        const batch = addresses.slice(i, i + BATCH_SIZE);
        const tokenPromises = batch.map(address => this.getTokenInfo(address));
        const batchTokens = await Promise.all(tokenPromises);
        
        tokens.push(...batchTokens.filter((t): t is Token => t !== null));
        
        // Add delay between batches
        if (i + BATCH_SIZE < addresses.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      return tokens;
    } catch (error) {
      console.error('Error detecting tokens:', error);
      return [];
    }
  }

  async verifyTokenBalance(token: Token, walletAddress: `0x${string}`): Promise<bigint> {
    try {
      const balance = await this.retryOperation(() =>
        this.client.readContract({
          address: token.address as `0x${string}`,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [walletAddress],
        })
      );
      return balance as bigint;
    } catch {
      return 0n;
    }
  }

  async detectAndVerifyTokens(walletAddress: `0x${string}`): Promise<{
    verifiedTokens: Token[];
    unverifiedTokens: Token[];
  }> {
    try {
      const detectedTokens = await this.detectTokens(walletAddress);
      const verifiedTokens: Token[] = [];
      const unverifiedTokens: Token[] = [];

      // Verify tokens in batches
      for (let i = 0; i < detectedTokens.length; i += BATCH_SIZE) {
        const batch = detectedTokens.slice(i, i + BATCH_SIZE);
        
        const verificationPromises = batch.map(async (token) => {
          const balance = await this.verifyTokenBalance(token, walletAddress);
          return { token, balance };
        });

        const results = await Promise.all(verificationPromises);

        for (const { token, balance } of results) {
          if (balance > 0n) {
            verifiedTokens.push({ ...token, isVerified: true });
          } else {
            unverifiedTokens.push({ ...token, isVerified: false });
          }
        }

        // Add delay between batches
        if (i + BATCH_SIZE < detectedTokens.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      return { verifiedTokens, unverifiedTokens };
    } catch (error) {
      console.error('Error in detectAndVerifyTokens:', error);
      return { verifiedTokens: [], unverifiedTokens: [] };
    }
  }
}