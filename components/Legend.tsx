
import React from 'react';

const Legend: React.FC = () => {
  return (
    <div className="mt-6 flex items-center justify-end flex-wrap gap-x-6 gap-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded-sm bg-status-confirmed"></span>
        <span>Réservé</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded-sm bg-status-option"></span>
        <span>Option</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 rounded-sm bg-status-blocked"></span>
        <span>Propriétaire</span>
      </div>
    </div>
  );
};

export default Legend;