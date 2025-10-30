import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Chalet } from '../lib/types';
import { cn } from '../lib/utils';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface ChaletSelectorProps {
  chalets: Chalet[];
  selectedChalets: Chalet[];
  onSelectionChange: (selected: Chalet[]) => void;
}

const ChaletSelector: React.FC<ChaletSelectorProps> = ({ chalets, selectedChalets, onSelectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Temporary state for mobile modal selections
  const [tempSelection, setTempSelection] = useState<Chalet[]>(selectedChalets);

  // Sync temp state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempSelection(selectedChalets);
    }
  }, [isOpen, selectedChalets]);

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

  const handleToggle = (chalet: Chalet) => {
    const isModal = isMobile;
    const currentSelection = isModal ? tempSelection : selectedChalets;
    const setSelection = isModal ? setTempSelection : onSelectionChange;
    
    const isSelected = currentSelection.some(c => c.id === chalet.id);
    if (isSelected) {
      setSelection(currentSelection.filter(c => c.id !== chalet.id));
    } else {
      setSelection([...currentSelection, chalet]);
    }
  };

  const handleReset = () => {
    if (isMobile) {
      setTempSelection([]);
    } else {
      onSelectionChange([]);
      setIsOpen(false);
    }
  };

  const handleApplySelection = () => {
    onSelectionChange(tempSelection);
    setIsOpen(false);
  };

  const renderChaletList = (isModal: boolean) => {
    const currentSelection = isModal ? tempSelection : selectedChalets;

    return (
      <ul className="divide-y divide-gray-200 dark:divide-border-dark">
        {chalets.map(chalet => {
          const isSelected = currentSelection.some(c => c.id === chalet.id);
          return (
            <li 
              key={chalet.id}
              onClick={() => handleToggle(chalet)}
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
          );
        })}
      </ul>
    );
  };
  
  const MobileModal = () => (
    ReactDOM.createPortal(
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
            <div 
              className="bg-white dark:bg-card-dark rounded-t-2xl flex flex-col h-[90vh] max-h-[700px] animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 border-b border-gray-200 dark:border-border-dark flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-bold">Sélectionner les chalets</h2>
                    <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </header>
                <div className="flex-grow overflow-y-auto">
                    {renderChaletList(true)}
                </div>
                <footer className="p-4 border-t border-gray-200 dark:border-border-dark flex items-center gap-4 flex-shrink-0">
                    <button onClick={handleReset} className="text-sm font-semibold text-primary hover:underline px-4">
                        Réinitialiser
                    </button>
                    <button 
                      onClick={handleApplySelection} 
                      className="flex-grow bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                        Valider
                    </button>
                </footer>
            </div>
             {/* CSS for animations */}
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

  const DesktopDropdown = () => (
    <div 
      className="absolute z-20 top-full mt-1 w-full sm:w-80 bg-white dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md shadow-lg"
      role="listbox"
    >
      <div className="max-h-80 overflow-y-auto">
        {renderChaletList(false)}
      </div>
      {selectedChalets.length > 0 && (
        <div className="p-2 border-t border-gray-200 dark:border-border-dark">
          <button onClick={handleReset} className="text-sm text-primary hover:underline w-full text-left p-1">
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );

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

      {isOpen && (isMobile ? <MobileModal /> : <DesktopDropdown />)}
    </div>
  );
};

export default ChaletSelector;