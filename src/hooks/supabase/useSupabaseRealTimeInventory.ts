
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useInventoryData } from '@/hooks/useInventoryData';
import { toast } from 'sonner';

export const useSupabaseRealTimeInventory = () => {
  const { data, syncData } = useInventoryData();
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  useEffect(() => {
    console.log('Setting up real-time inventory subscriptions...');

    // Subscribe to equipment_items changes
    const equipmentItemsChannel = supabase
      .channel('equipment-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipment_items'
        },
        (payload) => {
          console.log('Equipment items changed:', payload);
          handleInventoryChange('equipment_items', payload);
        }
      )
      .subscribe();

    // Subscribe to individual_equipment changes
    const individualEquipmentChannel = supabase
      .channel('individual-equipment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'individual_equipment'
        },
        (payload) => {
          console.log('Individual equipment changed:', payload);
          handleInventoryChange('individual_equipment', payload);
        }
      )
      .subscribe();

    // Subscribe to equipment_types changes
    const equipmentTypesChannel = supabase
      .channel('equipment-types-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipment_types'
        },
        (payload) => {
          console.log('Equipment types changed:', payload);
          handleInventoryChange('equipment_types', payload);
        }
      )
      .subscribe();

    // Subscribe to storage_locations changes
    const storageLocationsChannel = supabase
      .channel('storage-locations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'storage_locations'
        },
        (payload) => {
          console.log('Storage locations changed:', payload);
          handleInventoryChange('storage_locations', payload);
        }
      )
      .subscribe();

    setIsConnected(true);

    return () => {
      console.log('Cleaning up real-time inventory subscriptions...');
      supabase.removeChannel(equipmentItemsChannel);
      supabase.removeChannel(individualEquipmentChannel);
      supabase.removeChannel(equipmentTypesChannel);
      supabase.removeChannel(storageLocationsChannel);
      setIsConnected(false);
    };
  }, []);

  const handleInventoryChange = async (table: string, payload: any) => {
    try {
      console.log(`Real-time change detected in ${table}:`, payload.eventType);
      
      // Trigger a sync to refresh data
      await syncData();
      setLastSync(new Date());
      
      // Show user notification for significant changes
      if (payload.eventType === 'INSERT') {
        toast.info(`New ${table.replace('_', ' ')} added`);
      } else if (payload.eventType === 'UPDATE') {
        toast.info(`${table.replace('_', ' ').charAt(0).toUpperCase() + table.replace('_', ' ').slice(1)} updated`);
      } else if (payload.eventType === 'DELETE') {
        toast.info(`${table.replace('_', ' ').charAt(0).toUpperCase() + table.replace('_', ' ').slice(1)} removed`);
      }
    } catch (error) {
      console.error('Error handling real-time inventory change:', error);
      toast.error('Failed to sync inventory changes');
    }
  };

  const forceSync = async () => {
    try {
      await syncData();
      setLastSync(new Date());
      toast.success('Inventory data synchronized');
    } catch (error) {
      console.error('Error forcing inventory sync:', error);
      toast.error('Failed to sync inventory data');
    }
  };

  return {
    isConnected,
    lastSync,
    forceSync
  };
};
