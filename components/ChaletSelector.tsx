import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Chalet } from '../lib/types';
import { cn } from '../lib/utils';
import { useMediaQuery } from '../hooks/useMediaQuery';

// --- Sub-components extracted for stability ---

/**
 * A single item in the chalet list, used by both mobile and desktop views.
 */
const ChaletListItem: React.FC<{
  chalet: Chalet;
  isSelected: boolean;
  onToggle: (chalet: Chalet) => void;
}> = React.memo(({ chalet, isSelected, onToggle }) => (
  <li 
    onClick={() => onToggle(chalet)}
    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-4"
    role="option"
    aria-selected={isSelected}
  >
    <img 
      src={chalet.imageUrl} 
      alt={chalet.name} 
      className="w-16 h-12 object-cover rounded-md flex-shrink-0 bg-gray-200 dark:bg-gray-700" 
      loading="lazy"
    />
    <span className="flex-grow font-medium">{chalet.name}</span>
    <div className={cn(
        "w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors",
        isSelected ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-500'
    )}>
      {isSelected && <span className="material-symbols-outlined text-white text-base font-bold">check</span>}
    </div>
  </li>
));

/**
 * The mobile bottom-sheet modal.
 * By defining it outside the parent, it won't be re-created on re-renders, preventing animation restarts.
 */
const MobileModal: React.FC<{
  filteredChalets: Chalet[];
  tempSelection: Chalet[];
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggle: (chalet: Chalet) => void;
  onClose: () => void;
  onReset: () => void;
  onApply: () => void;
}> = ({ filteredChalets, tempSelection, searchQuery, onSearchChange, onToggle, onClose, onReset, onApply }) => (
  ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end animate-fade-in"
      onClick={onClose}
    >
        <div 
          className="bg-white dark:bg-card-dark rounded-t-2xl flex flex-col h-[90vh] max-h-[700px] animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
            <header className="p-4 border-b border-gray-200 dark:border-border-dark flex justify-between items-center flex-shrink-0">
                <h2 className="text-lg font-bold">Sélectionner les chalets</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </header>
            <div className="p-3 border-b border-gray-200 dark:border-border-dark flex-shrink-0">
              <input 
                type="search"
                placeholder="Rechercher un chalet..."
                value={searchQuery}
                onChange={onSearchChange}
                className="w-full p-2 border border-gray-300 dark:border-border-dark rounded-md bg-gray-50 dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex-grow overflow-y-auto">
              <ul className="divide-y divide-gray-200 dark:divide-border-dark">
                {filteredChalets.map(chalet => (
                  <ChaletListItem 
                    key={chalet.id}
                    chalet={chalet}
                    isSelected={tempSelection.some(c => c.id === chalet.id)}
                    onToggle={onToggle}
                  />
                ))}
              </ul>
            </div>
            <footer className="p-4 border-t border-gray-200 dark:border-border-dark flex items-center gap-4 flex-shrink-0">
                <button onClick={onReset} className="text-sm font-semibold text-primary hover:underline px-4">
                    Réinitialiser
                </button>
                <button 
                  onClick={onApply} 
                  className="flex-grow bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                    Valider
                </button>
            </footer>
        </div>
        <style>{`
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.3s ease-out; }
          @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
          .animate-slide-up { animation: slide-up 0.3s ease-out; }
        `}</style>
    </div>,
    document.body
  )
);

/**
 * The desktop dropdown menu.
 */
const DesktopDropdown: React.FC<{
  filteredChalets: Chalet[];
  selectedChalets: Chalet[];
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggle: (chalet: Chalet) => void;
  onReset: () => void;
}> = ({ filteredChalets, selectedChalets, searchQuery, onSearchChange, onToggle, onReset }) => (
  <div 
    className="absolute z-20 top-full mt-1 w-full sm:w-80 bg-white dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md shadow-lg flex flex-col"
    role="listbox"
  >
    <div className="p-2 border-b border-gray-200 dark:border-border-dark">
       <input 
        type="search"
        placeholder="Rechercher..."
        value={searchQuery}
        onChange={onSearchChange}
        className="w-full p-2 border border-gray-300 dark:border-border-dark rounded-md bg-gray-50 dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary text-sm"
      />
    </div>
    <div className="max-h-80 overflow-y-auto">
      <ul className="divide-y divide-gray-200 dark:divide-border-dark">
        {filteredChalets.map(chalet => (
          <ChaletListItem 
            key={chalet.id}
            chalet={chalet}
            isSelected={selectedChalets.some(c => c.id === chalet.id)}
            onToggle={onToggle}
          />
        ))}
      </ul>
    </div>
    {selectedChalets.length > 0 && (
      <div className="p-2 border-t border-gray-200 dark:border-border-dark">
        <button onClick={onReset} className="text-sm text-primary hover:underline w-full text-left p-1">
          Réinitialiser
        </button>
      </div>
    )}
  </div>
);


// --- Main Component ---

interface ChaletSelectorProps {
  chalets: Chalet[];
  selectedChalets: Chalet[];
  onSelectionChange: (chalets: Chalet[]) => void;
}

const ChaletSelector: React.FC<ChaletSelectorProps> = ({ chalets, selectedChalets, onSelectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [tempSelection, setTempSelection] = useState<Chalet[]>(selectedChalets);

  const filteredChalets = useMemo(() => {
    if (!searchQuery) return chalets;
    return chalets.filter(chalet => 
      chalet.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chalets, searchQuery]);

  // Sync temp state to the official selection when the modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery(''); // Reset search on open
      if (isMobile) {
        setTempSelection(selectedChalets);
      }
    }
  }, [isOpen, isMobile, selectedChalets]);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!isMobile && wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, isMobile]);
  
  const selectionText = selectedChalets.length === 0 
    ? "Tous les chalets" 
    : selectedChalets.length === 1
    ? selectedChalets[0].name
    : `${selectedChalets.length} chalets sélectionnés`;

  const handleMobileToggle = (chalet: Chalet) => {
    setTempSelection(current => 
      current.some(c => c.id === chalet.id)
        ? current.filter(c => c.id !== chalet.id)
        : [...current, chalet]
    );
  };

  const handleDesktopToggle = (chalet: Chalet) => {
    onSelectionChange(
      selectedChalets.some(c => c.id === chalet.id)
        ? selectedChalets.filter(c => c.id !== chalet.id)
        : [...selectedChalets, chalet]
    );
  };

  const handleMobileReset = () => {
    setTempSelection([]);
  };

  const handleDesktopReset = () => {
    onSelectionChange([]);
    setIsOpen(false);
  };

  const handleApplySelection = () => {
    onSelectionChange(tempSelection);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full sm:w-64 flex justify-between items-center p-2 border border-gray-300 dark:border-border-dark rounded-md bg-white dark:bg-background-dark text-left"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectionText}</span>
        <span className={cn("material-symbols-outlined transition-transform", isOpen && "rotate-180")}>expand_more</span>
      </button>

      {isOpen && (isMobile ? 
        <MobileModal 
          filteredChalets={filteredChalets}
          tempSelection={tempSelection}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onToggle={handleMobileToggle}
          onClose={() => setIsOpen(false)}
          onReset={handleMobileReset}
          onApply={handleApplySelection}
        /> 
        : 
        <DesktopDropdown 
          filteredChalets={filteredChalets}
          selectedChalets={selectedChalets}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onToggle={handleDesktopToggle}
          onReset={handleDesktopReset}
        />
      )}
    </div>
  );
};

export default ChaletSelector;