import React from 'react';
import { XCircle, ExternalLink, Share2 } from 'lucide-react';
import type { NFT } from '../hooks/useNFTs';

interface Props {
  nft: NFT;
  onClose: () => void;
}

export function NFTModal({ nft, onClose }: Props) {
  const isLiquidityPosition = nft.contractAddress.toLowerCase() === '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'.toLowerCase();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="animate-in zoom-in-95 duration-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-xl border border-purple-100 shadow-xl">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white p-6 border-b border-purple-100">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 text-transparent bg-clip-text">
                  {nft.name}
                </h3>
                {nft.collectionName && (
                  <p className="text-gray-600 mt-1">{nft.collectionName}</p>
                )}
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NFT Image */}
              <div className={`rounded-xl overflow-hidden bg-purple-50 ${isLiquidityPosition ? 'aspect-[2/1]' : 'aspect-square'}`}>
                {nft.image ? (
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className={`w-full h-full ${isLiquidityPosition ? 'object-contain p-4' : 'object-cover'}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>

              {/* NFT Details */}
              <div className="space-y-6">
                {nft.description && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{nft.description}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Details</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-gray-600">Token ID</span>
                      <span className="text-sm text-gray-900 font-medium">#{parseInt(nft.tokenId, 16)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-gray-600">Contract Address</span>
                      <a
                        href={`https://polygonscan.com/token/${nft.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        {nft.contractAddress.slice(0, 6)}...{nft.contractAddress.slice(-4)}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href={`https://opensea.io/assets/matic/${nft.contractAddress}/${nft.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 btn bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on OpenSea
                  </a>
                  <a
                    href={`https://polygonscan.com/token/${nft.contractAddress}?a=${nft.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 btn bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    View on Explorer
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}