import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useInventoryMapperContext } from '@/contexts/InventoryMapperContext';
import { toast } from 'sonner';

export const useInventoryMapperRealtime = () => {
  const { 
    updateSharedEquipment, 
    setAllocation, 
    removeAllocation,
    setSyncStatus,
    setLastSyncTime 
  } = useInventoryMapperContext();
  
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (isSubscribedRef.current || channelRef.current) {
      return;
    }

    console.log('Setting up inventory mapper real-time sync...');
    
    const channel = supabase
      .channel('inventory-mapper-sync')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'individual_equipment' 
        }, 
        (payload) => {
          console.log('Individual equipment real-time update:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const equipment = payload.new;
            
            // Update shared equipment state
            updateSharedEquipment(equipment.equipment_id, {
              status: equipment.status,
              jobId: equipment.job_id,
              lastUpdated: new Date()
            });

            // Update allocation if equipment is deployed
            if (equipment.status === 'deployed' && equipment.job_id) {
              setAllocation(equipment.equipment_id, {
                equipmentId: equipment.equipment_id,
                jobId: equipment.job_id,
                jobName: 'Job', // This would need to be fetched
                status: 'allocated',
                timestamp: new Date()
              });
            } else if (equipment.status === 'available') {
              removeAllocation(equipment.equipment_id);
            }

            setLastSyncTime(new Date());
          }
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipment_items'
        },
        (payload) => {
          console.log('Equipment items real-time update:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const item = payload.new;
            
            // Update shared equipment state for bulk items
            updateSharedEquipment(item.id, {
              status: item.status,
              jobId: item.job_id,
              lastUpdated: new Date()
            });

            setLastSyncTime(new Date());
          }
        }
      );

    // Subscribe to the channel
    channel.subscribe((status) => {
      console.log('Inventory mapper sync subscription status:', status);
      if (status === 'SUBSCRIBED') {
        isSubscribedRef.current = true;
        setSyncStatus('idle');
        toast.success('Real-time sync connected');
      } else if (status === 'CHANNEL_ERROR') {
        setSyncStatus('error');
        toast.error('Real-time sync connection failed');
      }
    });

    channelRef.current = channel;

    return () => {
      console.log('Cleaning up inventory mapper real-time sync...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [updateSharedEquipment, setAllocation, removeAllocation, setSyncStatus, setLastSyncTime]);

  return {
    isConnected: isSubscribedRef.current
  };
};