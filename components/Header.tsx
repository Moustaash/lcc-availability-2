import React from 'react';
import { SyncStatus } from '../lib/types';
import ThemeToggle from './ThemeToggle';
import { cn } from '../lib/utils';

interface HeaderProps {
  syncStatus: SyncStatus;
  lastGeneratedAt: string | null;
}

const Header: React.FC<HeaderProps> = ({ syncStatus, lastGeneratedAt }) => {
  const getStatusInfo = () => {
    switch (syncStatus) {
      case SyncStatus.IDLE:
        return { text: 'Initialisation...', color: 'bg-gray-400' };
      case SyncStatus.SYNCING:
        return { text: 'Synchronisation...', color: 'bg-yellow-500 animate-pulse' };
      case SyncStatus.SUCCESS:
        const dateText = lastGeneratedAt
          ? `À jour (${new Date(lastGeneratedAt).toLocaleString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })})`
          : 'À jour';
        return { text: dateText, color: 'bg-green-500' };
      case SyncStatus.ERROR:
        return { text: 'Erreur', color: 'bg-red-500' };
      default:
        return { text: '', color: '' };
    }
  };

  const { text, color } = getStatusInfo();

  return (
    <header className="bg-card border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Disponibilité des Chalets
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className={cn("h-2 w-2 rounded-full", color)}></span>
                <span className="text-muted-foreground">{text}</span>
            </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
