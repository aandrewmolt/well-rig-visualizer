
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useInventoryRealtime = (refetch: any) => {
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const isInitializedRef = useRef(false);
  const [optimisticDeletes, setOptimisticDeletes] = useState<Set<string>>(new Set());
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced refetch function
  const debouncedRefetch = (refetchFn: () => void, delay: number = 500) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      refetchFn();
    }, delay);
  };

  // Listen for optimistic delete events
  useEffect(() => {
    const handleOptimisticDelete = (event: CustomEvent) => {
      const itemId = event.detail;
      setOptimisticDeletes(prev => new Set(prev).add(itemId));
      
      // Remove from optimistic deletes after successful deletion
      setTimeout(() => {
        setOptimisticDeletes(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    };

    const handleDeleteFailed = (event: CustomEvent) => {
      const itemId = event.detail;
      setOptimisticDeletes(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    };

    window.addEventListener('equipment-deleted', handleOptimisticDelete);
    window.addEventListener('equipment-delete-failed', handleDeleteFailed);

    return () => {
      window.removeEventListener('equipment-deleted', handleOptimisticDelete);
      window.removeEventListener('equipment-delete-failed', handleDeleteFailed);
    };
  }, []);

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
        debouncedRefetch(refetch.refetchEquipmentTypes);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'storage_locations' }, () => {
        console.log('Storage locations changed, refetching...');
        debouncedRefetch(refetch.refetchStorageLocations);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_items' }, () => {
        console.log('Equipment items changed, refetching...');
        debouncedRefetch(refetch.refetchEquipmentItems);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'individual_equipment' }, (payload) => {
        console.log('Individual equipment changed:', payload.eventType, payload);
        
        // Don't refetch immediately if this is a delete operation we initiated
        if (payload.eventType === 'DELETE' && optimisticDeletes.has(payload.old?.id)) {
          console.log('Skipping refetch for optimistic delete');
          return;
        }
        
        debouncedRefetch(refetch.refetchIndividualEquipment, 200);
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
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [optimisticDeletes]);

  return {
    optimisticDeletes,
  };
};
