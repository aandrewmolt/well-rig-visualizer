import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { offlineDb } from '../../lib/offline/offlineDatabase';
import { syncManager } from '../../lib/offline/syncManager';
import { useToast } from '../use-toast';

interface UseOfflineFirstOptions {
  tableName: 'jobs' | 'equipment';
  enableAutoSync?: boolean;
}

export function useOfflineFirst<T>({ tableName, enableAutoSync = true }: UseOfflineFirstOptions) {
  const [data, setData] = useState<T[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back online",
        description: "Syncing your changes...",
      });
      if (enableAutoSync) {
        syncManager.performSync();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Working offline",
        description: "Your changes will sync when you're back online",
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableAutoSync, toast]);
  
  // Load data from appropriate source
  const loadData = useCallback(async () => {
    try {
      if (isOnline) {
        // Try to load from Supabase first
        const { data: remoteData, error } = await supabase
          .from(tableName)
          .select('*');
          
        if (!error && remoteData) {
          setData(remoteData as T[]);
          
          // Update local cache
          const table = offlineDb[tableName];
          await table.clear();
          for (const item of remoteData) {
            await table.add({
              ...item,
              cloudId: item.id,
              syncStatus: 'synced',
              updatedAt: Date.now()
            });
          }
        } else {
          // Fallback to local data
          await loadLocalData();
        }
      } else {
        await loadLocalData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      await loadLocalData();
    }
  }, [tableName, isOnline]);
  
  const loadLocalData = async () => {
    const table = offlineDb[tableName];
    const localData = await table.toArray();
    setData(localData as any as T[]);
  };
  
  // CRUD Operations
  const create = async (item: Omit<T, 'id'>) => {
    const table = offlineDb[tableName];
    const localId = await table.add({
      ...item,
      syncStatus: 'pending',
      updatedAt: Date.now()
    });
    
    if (isOnline) {
      try {
        const { data: created, error } = await supabase
          .from(tableName)
          .insert(item)
          .select()
          .single();
          
        if (!error && created) {
          await table.update(localId, {
            cloudId: created.id,
            syncStatus: 'synced'
          });
        }
      } catch (error) {
        // Queue for later sync
        await offlineDb.addToSyncQueue('create', tableName, String(localId), {
          ...item,
          localId
        });
      }
    } else {
      // Queue for sync when online
      await offlineDb.addToSyncQueue('create', tableName, String(localId), {
        ...item,
        localId
      });
    }
    
    await loadData();
  };
  
  const update = async (id: string | number, updates: Partial<T>) => {
    const table = offlineDb[tableName];
    
    // Find record by cloudId or local id
    let record;
    if (typeof id === 'string') {
      record = await table.where('cloudId').equals(id).first();
    } else {
      record = await table.get(id);
    }
    
    if (!record) return;
    
    // Update locally
    await table.update(record.id!, {
      ...updates,
      syncStatus: 'pending',
      updatedAt: Date.now()
    });
    
    if (isOnline && record.cloudId) {
      try {
        const { error } = await supabase
          .from(tableName)
          .update(updates)
          .eq('id', record.cloudId);
          
        if (!error) {
          await table.update(record.id!, { syncStatus: 'synced' });
        }
      } catch (error) {
        // Queue for later sync
        await offlineDb.addToSyncQueue('update', tableName, String(record.id), {
          cloudId: record.cloudId,
          localId: record.id,
          updates
        });
      }
    } else {
      // Queue for sync when online
      await offlineDb.addToSyncQueue('update', tableName, String(record.id), {
        cloudId: record.cloudId,
        localId: record.id,
        updates
      });
    }
    
    await loadData();
  };
  
  const remove = async (id: string | number) => {
    const table = offlineDb[tableName];
    
    // Find record
    let record;
    if (typeof id === 'string') {
      record = await table.where('cloudId').equals(id).first();
    } else {
      record = await table.get(id);
    }
    
    if (!record) return;
    
    if (isOnline && record.cloudId) {
      try {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', record.cloudId);
          
        if (!error) {
          await table.delete(record.id!);
        }
      } catch (error) {
        // Mark for deletion on sync
        await table.update(record.id!, { syncStatus: 'pending' });
        await offlineDb.addToSyncQueue('delete', tableName, String(record.id), {
          cloudId: record.cloudId
        });
      }
    } else {
      // Just delete locally if it was never synced
      await table.delete(record.id!);
    }
    
    await loadData();
  };
  
  const manualSync = async () => {
    if (!isOnline) {
      toast({
        title: "Cannot sync",
        description: "You're currently offline",
        variant: "destructive"
      });
      return;
    }
    
    setIsSyncing(true);
    try {
      await syncManager.performSync();
      setLastSyncTime(new Date());
      toast({
        title: "Sync complete",
        description: "All changes have been synchronized",
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Some changes couldn't be synchronized",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
      await loadData();
    }
  };
  
  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Periodic sync when online
  useEffect(() => {
    if (!isOnline || !enableAutoSync) return;
    
    const interval = setInterval(() => {
      syncManager.performSync();
    }, 60000); // Sync every minute
    
    return () => clearInterval(interval);
  }, [isOnline, enableAutoSync]);
  
  return {
    data,
    isOnline,
    isSyncing,
    lastSyncTime,
    create,
    update,
    remove,
    refresh: loadData,
    sync: manualSync
  };
}