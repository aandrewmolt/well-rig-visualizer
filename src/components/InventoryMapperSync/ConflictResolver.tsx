import React from 'react';
import { useInventoryMapperSync } from '@/hooks/useInventoryMapperSync';
import { EquipmentConflict } from '@/hooks/useInventoryMapperSync';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const ConflictResolver: React.FC = () => {
  const { conflicts, resolveConflict } = useInventoryMapperSync();

  if (conflicts.length === 0) {
    return null;
  }

  const handleResolve = async (conflict: EquipmentConflict, resolution: 'current' | 'requested') => {
    try {
      await resolveConflict(conflict, resolution);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold text-gray-900">Equipment Conflicts ({conflicts.length})</h3>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {conflicts.map((conflict) => (
          <div key={conflict.equipmentId} className="border border-gray-200 rounded-md p-3">
            <div className="text-sm font-medium text-gray-900 mb-1">
              {conflict.equipmentName}
            </div>
            
            <div className="text-xs text-gray-600 mb-2">
              <div>Current: {conflict.currentJobName}</div>
              <div>Requested: {conflict.requestedJobName}</div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleResolve(conflict, 'current')}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
              >
                <XCircle className="h-3 w-3" />
                Keep Current
              </button>
              
              <button
                onClick={() => handleResolve(conflict, 'requested')}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                <CheckCircle className="h-3 w-3" />
                Move to Requested
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};