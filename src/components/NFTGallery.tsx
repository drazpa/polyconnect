import React, { useState, useMemo } from 'react';
import { useNFTs } from '../hooks/useNFTs';
import { ExternalLink, Image as ImageIcon, Loader2, Wallet, TrendingUp } from 'lucide-react';
import { NFTModal } from './NFTModal';
import type { NFT } from '../hooks/useNFTs';

const UNISWAP_V3_NFT_ADDRESS = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88';

export function NFTGallery() {
  const { nfts, isLoading, error } = useNFTs();
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  const { liquidityPositions, regularNFTs } = useMemo(() => {
    const positions = nfts.filter(nft => 
      nft.contractAddress.toLowerCase() === UNISWAP_V3_NFT_ADDRESS.toLowerCase()
    );
    const regular = nfts.filter(nft => 
      nft.contractAddress.toLowerCase() !== UNISWAP_V3_NFT_ADDRESS.toLowerCase()
    );
    return { liquidityPositions: positions, regularNFTs: regular };
  }, [nfts]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load NFTs. Please try again later.</p>
      </div>
    );
  }

  if (!nfts.length) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No NFTs found in this wallet</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Liquidity Positions */}
      {liquidityPositions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-600" />
            Uniswap V3 Positions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liquidityPositions.map((nft) => (
              <div
                key={nft.id}
                className="glass-card rounded-lg overflow-hidden purple-glow purple-glow-hover group cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                onClick={() => setSelectedNFT(nft)}
              >
                <div className="relative">
                  <div className="aspect-[2/1] bg-gradient-to-br from-purple-50 to-white">
                    {nft.image ? (
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-full object-contain p-4"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Wallet className="w-12 h-12 text-purple-200" />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={`https://app.uniswap.org/#/pool/${nft.tokenId}?chain=polygon`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/90 text-purple-600 hover:text-purple-700 shadow-lg backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {nft.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">Active Position</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular NFTs */}
      {regularNFTs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            NFT Collection
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {regularNFTs.map((nft) => (
              <div
                key={nft.id}
                className="glass-card rounded-lg overflow-hidden purple-glow purple-glow-hover group cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                onClick={() => setSelectedNFT(nft)}
              >
                <div className="aspect-square relative bg-gray-100">
                  {nft.image ? (
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-purple-200" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={`https://polygonscan.com/token/${nft.contractAddress}?a=${nft.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/90 text-purple-600 hover:text-purple-700 shadow-lg backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="p-3">
                  <div>
                    <h3 className="font-medium text-sm text-gray-900 truncate">
                      {nft.name}
                    </h3>
                    {nft.collectionName && (
                      <p className="text-xs text-gray-500 truncate">
                        {nft.collectionName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedNFT && (
        <NFTModal nft={selectedNFT} onClose={() => setSelectedNFT(null)} />
      )}
    </div>
  );
}