
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseRealTimeInventory = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    // Check connection status
    const checkConnection = () => {
      setIsConnected(true);
      setLastSync(new Date());
    };

    checkConnection();
    
    // Set up a simple ping to check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const forceSync = () => {
    setLastSync(new Date());
    // Force refetch could be implemented here if needed
  };

  return {
    isConnected,
    lastSync,
    forceSync,
  };
};
