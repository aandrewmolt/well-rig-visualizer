
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EquipmentItem, IndividualEquipment } from '@/types/inventory';

export const useSupabaseEquipmentMutations = () => {
  const queryClient = useQueryClient();

  const updateEquipmentItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EquipmentItem> }) => {
      const { error } = await supabase
        .from('equipment_items')
        .update({
          type_id: updates.typeId,
          location_id: updates.locationId,
          quantity: updates.quantity,
          status: updates.status,
          job_id: updates.jobId,
          notes: updates.notes,
          red_tag_reason: updates.redTagReason,
          red_tag_photo: updates.redTagPhoto,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-items'] });
      toast.success('Equipment updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update equipment:', error);
      toast.error('Failed to update equipment');
    }
  });

  const updateIndividualEquipmentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<IndividualEquipment> }) => {
      const { error } = await supabase
        .from('individual_equipment')
        .update({
          equipment_id: updates.equipmentId,
          name: updates.name,
          type_id: updates.typeId,
          location_id: updates.locationId,
          status: updates.status,
          job_id: updates.jobId,
          serial_number: updates.serialNumber,
          purchase_date: updates.purchaseDate?.toISOString().split('T')[0],
          warranty_expiry: updates.warrantyExpiry?.toISOString().split('T')[0],
          notes: updates.notes,
          red_tag_reason: updates.redTagReason,
          red_tag_photo: updates.redTagPhoto,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['individual-equipment'] });
      toast.success('Individual equipment updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update individual equipment:', error);
      toast.error('Failed to update individual equipment');
    }
  });

  const addEquipmentItemMutation = useMutation({
    mutationFn: async (newItem: Omit<EquipmentItem, 'id' | 'lastUpdated'>) => {
      const { error } = await supabase
        .from('equipment_items')
        .insert({
          type_id: newItem.typeId,
          location_id: newItem.locationId,
          quantity: newItem.quantity,
          status: newItem.status,
          job_id: newItem.jobId,
          notes: newItem.notes,
          red_tag_reason: newItem.redTagReason,
          red_tag_photo: newItem.redTagPhoto,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-items'] });
      toast.success('Equipment item added successfully');
    },
    onError: (error) => {
      console.error('Failed to add equipment item:', error);
      toast.error('Failed to add equipment item');
    }
  });

  const addIndividualEquipmentMutation = useMutation({
    mutationFn: async (newEquipment: Omit<IndividualEquipment, 'id' | 'lastUpdated'>) => {
      const { error } = await supabase
        .from('individual_equipment')
        .insert({
          equipment_id: newEquipment.equipmentId,
          name: newEquipment.name,
          type_id: newEquipment.typeId,
          location_id: newEquipment.locationId,
          status: newEquipment.status,
          job_id: newEquipment.jobId,
          serial_number: newEquipment.serialNumber,
          purchase_date: newEquipment.purchaseDate?.toISOString().split('T')[0],
          warranty_expiry: newEquipment.warrantyExpiry?.toISOString().split('T')[0],
          notes: newEquipment.notes,
          red_tag_reason: newEquipment.redTagReason,
          red_tag_photo: newEquipment.redTagPhoto,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['individual-equipment'] });
      toast.success('Individual equipment added successfully');
    },
    onError: (error) => {
      console.error('Failed to add individual equipment:', error);
      toast.error('Failed to add individual equipment');
    }
  });

  return {
    updateSingleEquipmentItem: (itemId: string, updates: Partial<EquipmentItem>) => {
      updateEquipmentItemMutation.mutate({ id: itemId, updates });
    },
    
    updateSingleIndividualEquipment: (equipmentId: string, updates: Partial<IndividualEquipment>) => {
      updateIndividualEquipmentMutation.mutate({ id: equipmentId, updates });
    },

    addEquipmentItem: (newItem: Omit<EquipmentItem, 'id' | 'lastUpdated'>) => {
      addEquipmentItemMutation.mutate(newItem);
    },

    addIndividualEquipment: (newEquipment: Omit<IndividualEquipment, 'id' | 'lastUpdated'>) => {
      addIndividualEquipmentMutation.mutate(newEquipment);
    },
  };
};
