import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Chalet } from '../lib/types';
import { cn } from '../lib/utils';
import { useMediaQuery } from '../hooks/useMediaQuery';

// --- Sub-components extracted for stability ---

const ChaletListItem: React.FC<{
  chalet: Chalet;
  isSelected: boolean;
  onToggle: (chalet: Chalet) => void;
}> = React.memo(({ chalet, isSelected, onToggle }) => (
  <li 
    onClick={() => onToggle(chalet)}
    className={cn(
        "p-3 cursor-pointer flex items-center gap-4 transition-colors",
        isSelected ? "bg-accent/50" : "hover:bg-accent/50"
    )}
    role="option"
    aria-selected={isSelected}
  >
    <div className="relative w-16 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted border border-border/50">
        <img 
        src={chalet.imageUrl} 
        alt={chalet.name} 
        className="w-full h-full object-cover" 
        loading="lazy"
        />
    </div>
    <span className="flex-grow font-medium text-sm">{chalet.name}</span>
    <div className={cn(
        "w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-all",
        isSelected ? 'bg-primary border-primary text-primary-foreground scale-100' : 'border-input scale-90'
    )}>
      {isSelected && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
    </div>
  </li>
));

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
      className="fixed inset-0 bg-black/60 z-[60] flex flex-col justify-end animate-fade-in backdrop-blur-sm"
      onClick={onClose}
    >
        <div 
          className="bg-background rounded-t-2xl flex flex-col h-[90vh] max-h-[700px] animate-slide-up shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
            <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <h2 className="text-lg font-bold">Sélectionner les chalets</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-accent text-muted-foreground">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </header>
            <div className="p-4 border-b flex-shrink-0 bg-muted/20">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">search</span>
                <input 
                    type="search"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={onSearchChange}
                    className="flex h-10 w-full rounded-full border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
            <div className="flex-grow overflow-y-auto">
              <ul className="divide-y divide-border/40">
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
            <footer className="p-4 border-t flex items-center gap-4 flex-shrink-0 bg-background">
                <button onClick={onReset} className="text-sm font-semibold text-muted-foreground hover:text-primary px-4 transition-colors">
                    Tout effacer
                </button>
                <button 
                  onClick={onApply} 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-bold transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 flex-grow shadow-lg shadow-primary/20"
                >
                    Valider ({tempSelection.length})
                </button>
            </footer>
        </div>
        <style>{`
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.3s ease-out; }
          @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
          .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        `}</style>
    </div>,
    document.body
  )
);

const DesktopDropdown: React.FC<{
  filteredChalets: Chalet[];
  selectedChalets: Chalet[];
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggle: (chalet: Chalet) => void;
  onReset: () => void;
}> = ({ filteredChalets, selectedChalets, searchQuery, onSearchChange, onToggle, onReset }) => (
  <div 
    className="absolute z-20 top-full right-0 mt-2 w-80 bg-popover text-popover-foreground border rounded-xl shadow-xl flex flex-col overflow-hidden animate-fade-in"
    role="listbox"
  >
    <div className="p-3 border-b bg-muted/30">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[18px]">search</span>
        <input 
            type="search"
            placeholder="Filtrer les chalets..."
            value={searchQuery}
            onChange={onSearchChange}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>
    <div className="max-h-[400px] overflow-y-auto p-1">
      <ul className="space-y-1">
        {filteredChalets.map(chalet => (
          <div key={chalet.id} className="rounded-md overflow-hidden">
             <ChaletListItem 
                chalet={chalet}
                isSelected={selectedChalets.some(c => c.id === chalet.id)}
                onToggle={onToggle}
            />
          </div>
        ))}
      </ul>
    </div>
    {selectedChalets.length > 0 && (
      <div className="p-2 border-t bg-muted/20">
        <button onClick={onReset} className="text-xs font-medium text-primary hover:text-primary/80 hover:underline w-full text-center p-2">
          Réinitialiser la sélection
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

  useEffect(() => {
    if (isOpen) {
      setSearchQuery(''); 
      if (isMobile) {
        setTempSelection(selectedChalets);
      }
    }
  }, [isOpen, isMobile, selectedChalets]);

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
    : `${selectedChalets.length} chalets`;

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

  const handleDesktopReset = () => {
    onSelectionChange([]);
    setIsOpen(false);
  };

  const handleApplySelection = () => {
    onSelectionChange(tempSelection);
    setIsOpen(false);
  };
  
  const handleMobileReset = () => {
    setTempSelection([]);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={cn(
            "inline-flex items-center justify-between whitespace-nowrap rounded-md text-sm font-semibold transition-all h-9 px-4 py-2 w-full sm:w-64 text-left",
            "border border-border bg-card shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md",
            isOpen && "ring-2 ring-primary/20 border-primary"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
            <span className="material-symbols-outlined text-[18px] text-muted-foreground">filter_alt</span>
            <span className="truncate">{selectionText}</span>
        </div>
        <span className={cn("material-symbols-outlined text-[18px] transition-transform text-muted-foreground", isOpen && "rotate-180")}>expand_more</span>
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