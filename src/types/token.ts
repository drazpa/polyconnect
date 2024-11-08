export interface Token {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  coingeckoId?: string;
  isNative?: boolean;
  isVerified?: boolean;
  isCustom?: boolean;
}