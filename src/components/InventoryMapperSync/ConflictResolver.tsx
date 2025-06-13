import React, { useState } from 'react';
import { useInventoryMapperSync } from '@/hooks/useInventoryMapperSync';
import { EquipmentConflict } from '@/hooks/useInventoryMapperSync';
import { AlertTriangle, CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ConflictResolver: React.FC = () => {
  const { conflicts, resolveConflict } = useInventoryMapperSync();
  const [resolvingConflicts, setResolvingConflicts] = useState<Map<string, string>>(new Map());
  const [resolvedConflicts, setResolvedConflicts] = useState<Set<string>>(new Set());

  if (conflicts.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
        <p className="text-gray-600">No equipment conflicts detected</p>
        <p className="text-sm text-gray-500 mt-1">All equipment assignments are valid</p>
      </div>
    );
  }

  const handleResolve = async (conflict: EquipmentConflict, resolution: 'current' | 'requested') => {
    const conflictId = conflict.equipmentId;
    
    setResolvingConflicts(prev => {
      const newMap = new Map(prev);
      newMap.set(conflictId, resolution);
      return newMap;
    });
    
    try {
      await resolveConflict(conflict, resolution);
      setResolvedConflicts(prev => new Set(prev).add(conflictId));
      
      // Remove from resolved after animation
      setTimeout(() => {
        setResolvedConflicts(prev => {
          const newSet = new Set(prev);
          newSet.delete(conflictId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setResolvingConflicts(prev => {
        const newMap = new Map(prev);
        newMap.delete(conflictId);
        return newMap;
      });
    }
  };

  return (
    <div className="space-y-4">
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>{conflicts.length} equipment conflict{conflicts.length > 1 ? 's' : ''} detected.</strong>
          <br />
          Equipment is currently assigned to one job but requested by another. Choose where each piece of equipment should be assigned.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {conflicts.map((conflict) => {
          const resolvingResolution = resolvingConflicts.get(conflict.equipmentId);
          const isResolving = resolvingResolution !== undefined;
          const isResolved = resolvedConflicts.has(conflict.equipmentId);
          
          return (
          <div 
            key={conflict.equipmentId} 
            className={`
              border rounded-lg p-4 transition-all duration-300
              ${isResolved ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}
              ${isResolving ? 'opacity-75' : ''}
            `}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {conflict.equipmentName}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {conflict.equipmentId}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Conflict detected at {new Date(conflict.timestamp).toLocaleTimeString()}
                </div>
              </div>
              {isResolved && (
                <CheckCircle className="h-5 w-5 text-green-500 animate-pulse" />
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs font-medium text-gray-600 mb-1">Currently Assigned To:</div>
                <div className="text-sm font-semibold text-gray-900">{conflict.currentJobName}</div>
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-xs font-medium text-blue-600 mb-1">Requested By:</div>
                <div className="text-sm font-semibold text-blue-900">{conflict.requestedJobName}</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleResolve(conflict, 'current')}
                disabled={isResolving || isResolved}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 rounded-md transition-colors"
              >
                {isResolving && resolvingResolution === 'current' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Keep in {conflict.currentJobName}
              </button>
              
              <button
                onClick={() => handleResolve(conflict, 'requested')}
                disabled={isResolving || isResolved}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-md transition-colors"
              >
                {isResolving && resolvingResolution === 'requested' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Move to {conflict.requestedJobName}
              </button>
            </div>
          </div>
          );
        })}
      </div>
      
      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Resolving conflicts will automatically update the equipment status in both the inventory and job assignments. Changes are synced in real-time.
        </p>
      </div>
    </div>
  );
};