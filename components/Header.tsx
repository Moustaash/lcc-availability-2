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
          ? `${new Date(lastGeneratedAt).toLocaleString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}`
          : '';
        return { text: dateText, color: 'bg-emerald-500' };
      case SyncStatus.ERROR:
        return { text: 'Erreur', color: 'bg-red-500' };
      default:
        return { text: '', color: '' };
    }
  };

  const { text, color } = getStatusInfo();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                <span className="material-symbols-outlined text-[20px]">cottage</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-foreground hidden sm:block">
            Chalet Manager
            </h1>
        </div>

        <div className="flex items-center gap-4">
            {text && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50">
                    <span className={cn("h-2 w-2 rounded-full", color)}></span>
                    <span className="text-xs font-medium text-muted-foreground">{text}</span>
                </div>
            )}
            <div className="w-px h-6 bg-border/60 hidden sm:block"></div>
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;