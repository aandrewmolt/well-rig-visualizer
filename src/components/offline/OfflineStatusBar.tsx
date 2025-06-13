import React from 'react';
import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useOfflineFirst } from '../../hooks/offline/useOfflineFirst';
import { format } from 'date-fns';

export function OfflineStatusBar() {
  const { isOnline, isSyncing, lastSyncTime, sync } = useOfflineFirst({ 
    tableName: 'jobs',
    enableAutoSync: true 
  });
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">Offline</span>
            </>
          )}
        </div>
        
        {/* Sync Status */}
        {isSyncing && (
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Syncing...</span>
          </div>
        )}
        
        {/* Last Sync Time */}
        {lastSyncTime && !isSyncing && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last sync: {format(lastSyncTime, 'HH:mm')}
          </div>
        )}
        
        {/* Pending Changes Indicator */}
        <PendingChangesIndicator />
        
        {/* Manual Sync Button */}
        {isOnline && !isSyncing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={sync}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function PendingChangesIndicator() {
  const [pendingCount, setPendingCount] = React.useState(0);
  
  React.useEffect(() => {
    const checkPending = async () => {
      const { offlineDb } = await import('../../lib/offline/offlineDatabase');
      const pending = await offlineDb.syncQueue.count();
      setPendingCount(pending);
    };
    
    checkPending();
    const interval = setInterval(checkPending, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (pendingCount === 0) return null;
  
  return (
    <Badge variant="outline" className="gap-1">
      <AlertCircle className="h-3 w-3" />
      {pendingCount} pending
    </Badge>
  );
}