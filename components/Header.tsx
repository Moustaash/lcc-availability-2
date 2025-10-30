
import React from 'react';
import { SyncStatus } from '../lib/types';
import ThemeToggle from './ThemeToggle';
import { cn } from '../lib/utils';

interface HeaderProps {
  syncStatus: SyncStatus;
}

const Header: React.FC<HeaderProps> = ({ syncStatus }) => {
  const statusInfo = {
    [SyncStatus.IDLE]: { text: 'Initialisation...', color: 'bg-gray-400' },
    [SyncStatus.SYNCING]: { text: 'Synchronisation...', color: 'bg-yellow-500 animate-pulse' },
    [SyncStatus.SUCCESS]: { text: 'À jour', color: 'bg-green-500' },
    [SyncStatus.ERROR]: { text: 'Erreur', color: 'bg-red-500' },
  };

  const { text, color } = statusInfo[syncStatus];

  return (
    <header className="bg-white dark:bg-card-dark shadow-sm border-b border-gray-200 dark:border-border-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Disponibilité des Chalets
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className={cn("h-2 w-2 rounded-full", color)}></span>
                <span className="text-gray-500 dark:text-gray-400">{text}</span>
            </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
