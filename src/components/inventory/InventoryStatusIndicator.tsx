
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';
import { useSupabaseRealTimeInventory } from '@/hooks/supabase/useSupabaseRealTimeInventory';

const InventoryStatusIndicator: React.FC = () => {
  const { isConnected, lastSync, forceSync } = useSupabaseRealTimeInventory();

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
        {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {isConnected ? 'Real-time' : 'Offline'}
      </Badge>
      
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Clock className="h-3 w-3" />
        Last sync: {lastSync.toLocaleTimeString()}
      </div>
      
      <Button
        onClick={forceSync}
        size="sm"
        variant="outline"
        className="h-6 px-2"
      >
        <RefreshCw className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default InventoryStatusIndicator;
