import React, { useState, useRef, useEffect } from 'react';
import { Chalet } from '../lib/types';
import { cn } from '../lib/utils';

interface ChaletSelectorProps {
  chalets: Chalet[];
  selectedChalets: Chalet[];
  onSelectionChange: (selected: Chalet[]) => void;
}

const ChaletSelector: React.FC<ChaletSelectorProps> = ({ chalets, selectedChalets, onSelectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = (chalet: Chalet) => {
    const isSelected = selectedChalets.some(c => c.id === chalet.id);
    if (isSelected) {
      onSelectionChange(selectedChalets.filter(c => c.id !== chalet.id));
    } else {
      onSelectionChange([...selectedChalets, chalet]);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);
  
  const selectionText = selectedChalets.length === 0 
    ? "Tous les chalets" 
    : selectedChalets.length === 1
    ? selectedChalets[0].name
    : `${selectedChalets.length} chalets sélectionnés`;

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

      {isOpen && (
        <div 
          className="absolute z-10 top-full mt-1 w-full sm:w-64 bg-white dark:bg-card-dark border border-gray-300 dark:border-border-dark rounded-md shadow-lg"
          role="listbox"
        >
          <ul className="max-h-60 overflow-y-auto">
            {chalets.map(chalet => {
              const isSelected = selectedChalets.some(c => c.id === chalet.id);
              return (
                <li 
                  key={chalet.id}
                  onClick={() => handleToggle(chalet)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3"
                  role="option"
                  aria-selected={isSelected}
                >
                  <input type="checkbox" readOnly checked={isSelected} className="pointer-events-none w-4 h-4 rounded accent-primary" />
                  <span>{chalet.name}</span>
                </li>
              );
            })}
          </ul>
           {selectedChalets.length > 0 && (
            <div className="p-2 border-t border-gray-200 dark:border-border-dark">
              <button onClick={() => { onSelectionChange([]); setIsOpen(false); }} className="text-sm text-primary hover:underline w-full text-left">
                Réinitialiser
              </button>
            </div>
           )}
        </div>
      )}
    </div>
  );
};

export default ChaletSelector;
