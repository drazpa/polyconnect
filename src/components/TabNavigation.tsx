import React from 'react';
import { Wallet, Image } from 'lucide-react';

interface TabProps {
  tabs: readonly string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabNavigation({ tabs, activeTab, onTabChange }: TabProps) {
  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'Assets':
        return <Wallet className="w-4 h-4" />;
      case 'NFTs':
        return <Image className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="border-b border-purple-100 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`
              whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-all duration-200
              flex items-center gap-2
              ${activeTab === tab
                ? 'border-purple-500 text-purple-600 bg-purple-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/50'
              }
            `}
          >
            {getTabIcon(tab)}
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
}