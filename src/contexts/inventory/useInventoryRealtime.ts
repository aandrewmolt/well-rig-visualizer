
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useInventoryRealtime = (refetch: any) => {
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Set up real-time subscriptions only once per app lifecycle
  useEffect(() => {
    if (isSubscribedRef.current || channelRef.current || isInitializedRef.current) {
      return;
    }

    console.log('Setting up centralized real-time subscriptions...');
    isInitializedRef.current = true;
    
    const channel = supabase
      .channel('inventory-changes-global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_types' }, () => {
        console.log('Equipment types changed, refetching...');
        refetch.refetchEquipmentTypes();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'storage_locations' }, () => {
        console.log('Storage locations changed, refetching...');
        refetch.refetchStorageLocations();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_items' }, () => {
        console.log('Equipment items changed, refetching...');
        refetch.refetchEquipmentItems();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'individual_equipment' }, () => {
        console.log('Individual equipment changed, refetching...');
        refetch.refetchIndividualEquipment();
      });

    channel.subscribe((status) => {
      console.log('Global subscription status:', status);
      if (status === 'SUBSCRIBED') {
        isSubscribedRef.current = true;
      }
    });

    channelRef.current = channel;

    return () => {
      console.log('Cleaning up centralized real-time subscriptions...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
        isInitializedRef.current = false;
      }
    };
  }, []);
};
