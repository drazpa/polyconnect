import React, { useState } from 'react';
import { XCircle, Shield, AlertTriangle, Check } from 'lucide-react';
import { Token } from '../types/token';

interface Props {
  token: Token;
  onClose: () => void;
  onVerify: (token: Token) => void;
}

export function TokenVerificationModal({ token, onClose, onVerify }: Props) {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 1500));
    onVerify(token);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-md rounded-xl p-6 max-w-md w-full mx-4 border border-purple-500/20 shadow-[0_0_25px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
              Verify Custom Token
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-200">
                Please verify this token carefully before adding it to your trusted list
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <span className="text-sm text-gray-400">Token Name</span>
                <span className="text-sm text-gray-200 font-medium">{token.name}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <span className="text-sm text-gray-400">Symbol</span>
                <span className="text-sm text-gray-200 font-medium">{token.symbol}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <span className="text-sm text-gray-400">Contract Address</span>
                <a 
                  href={`https://polygonscan.com/token/${token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {token.address.slice(0, 6)}...{token.address.slice(-4)}
                </a>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={onClose}
                className="flex-1 btn bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="flex-1 btn btn-primary"
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    Verify Token
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}