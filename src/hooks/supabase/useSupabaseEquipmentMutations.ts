
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EquipmentItem, IndividualEquipment, StorageLocation, EquipmentType } from '@/types/inventory';

export const useSupabaseEquipmentMutations = () => {
  const queryClient = useQueryClient();

  // Helper function to invalidate all related queries
  const invalidateAllQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['equipment-types'] });
    queryClient.invalidateQueries({ queryKey: ['storage-locations'] });
    queryClient.invalidateQueries({ queryKey: ['equipment-items'] });
    queryClient.invalidateQueries({ queryKey: ['individual-equipment'] });
  };

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
      return { id, updates };
    },
    onSuccess: () => {
      invalidateAllQueries();
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
      return { id, updates };
    },
    onSuccess: () => {
      invalidateAllQueries();
      toast.success('Individual equipment updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update individual equipment:', error);
      toast.error('Failed to update individual equipment');
    }
  });

  const addEquipmentItemMutation = useMutation({
    mutationFn: async (newItem: Omit<EquipmentItem, 'id' | 'lastUpdated'>) => {
      const { data, error } = await supabase
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
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateAllQueries();
      toast.success('Equipment item added successfully');
    },
    onError: (error) => {
      console.error('Failed to add equipment item:', error);
      toast.error('Failed to add equipment item');
    }
  });

  const addIndividualEquipmentMutation = useMutation({
    mutationFn: async (newEquipment: Omit<IndividualEquipment, 'id' | 'lastUpdated'>) => {
      const { data, error } = await supabase
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
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateAllQueries();
      toast.success('Individual equipment added successfully');
    },
    onError: (error) => {
      console.error('Failed to add individual equipment:', error);
      toast.error('Failed to add individual equipment');
    }
  });

  const addBulkIndividualEquipmentMutation = useMutation({
    mutationFn: async (equipment: Omit<IndividualEquipment, 'id' | 'lastUpdated'>[]) => {
      const { data, error } = await supabase
        .from('individual_equipment')
        .insert(equipment.map(eq => ({
          equipment_id: eq.equipmentId,
          name: eq.name,
          type_id: eq.typeId,
          location_id: eq.locationId,
          status: eq.status,
          job_id: eq.jobId,
          serial_number: eq.serialNumber,
          purchase_date: eq.purchaseDate?.toISOString().split('T')[0],
          warranty_expiry: eq.warrantyExpiry?.toISOString().split('T')[0],
          notes: eq.notes,
        })))
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      invalidateAllQueries();
      toast.success(`${data?.length || 0} equipment items added successfully`);
    },
    onError: (error) => {
      console.error('Failed to add bulk equipment:', error);
      toast.error('Failed to add bulk equipment');
    }
  });

  const createEquipmentTypeMutation = useMutation({
    mutationFn: async (newType: Omit<EquipmentType, 'id'>) => {
      const { data, error } = await supabase
        .from('equipment_types')
        .insert({
          name: newType.name,
          category: newType.category,
          description: newType.description,
          requires_individual_tracking: newType.requiresIndividualTracking,
          default_id_prefix: newType.defaultIdPrefix,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateAllQueries();
      toast.success('Equipment type created successfully');
    },
    onError: (error) => {
      console.error('Failed to create equipment type:', error);
      toast.error('Failed to create equipment type');
    }
  });

  const updateEquipmentTypeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EquipmentType> }) => {
      const { data, error } = await supabase
        .from('equipment_types')
        .update({
          name: updates.name,
          category: updates.category,
          description: updates.description,
          requires_individual_tracking: updates.requiresIndividualTracking,
          default_id_prefix: updates.defaultIdPrefix,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateAllQueries();
      toast.success('Equipment type updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update equipment type:', error);
      toast.error('Failed to update equipment type');
    }
  });

  const deleteEquipmentTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipment_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      invalidateAllQueries();
      toast.success('Equipment type deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete equipment type:', error);
      toast.error('Failed to delete equipment type');
    }
  });

  const createStorageLocationMutation = useMutation({
    mutationFn: async (newLocation: Omit<StorageLocation, 'id'>) => {
      // If setting as default, first unset any existing default
      if (newLocation.isDefault) {
        await supabase
          .from('storage_locations')
          .update({ is_default: false })
          .eq('is_default', true);
      }

      const { data, error } = await supabase
        .from('storage_locations')
        .insert({
          name: newLocation.name,
          address: newLocation.address,
          is_default: newLocation.isDefault,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateAllQueries();
      toast.success('Storage location created successfully');
    },
    onError: (error) => {
      console.error('Failed to create storage location:', error);
      toast.error('Failed to create storage location');
    }
  });

  const updateStorageLocationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<StorageLocation> }) => {
      // If setting as default, first unset any existing default
      if (updates.isDefault) {
        await supabase
          .from('storage_locations')
          .update({ is_default: false })
          .eq('is_default', true)
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('storage_locations')
        .update({
          name: updates.name,
          address: updates.address,
          is_default: updates.isDefault,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateAllQueries();
      toast.success('Storage location updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update storage location:', error);
      toast.error('Failed to update storage location');
    }
  });

  const deleteStorageLocationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('storage_locations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      invalidateAllQueries();
      toast.success('Storage location deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete storage location:', error);
      toast.error('Failed to delete storage location');
    }
  });

  // Helper function to create storage location from job name
  const createJobStorageLocation = async (jobName: string) => {
    const existingLocation = queryClient.getQueryData<StorageLocation[]>(['storage-locations'])
      ?.find(loc => loc.name === jobName);
    
    if (!existingLocation) {
      return createStorageLocationMutation.mutateAsync({
        name: jobName,
        address: undefined,
        isDefault: false
      });
    }
    return existingLocation;
  };

  return {
    // Equipment Items
    updateSingleEquipmentItem: (itemId: string, updates: Partial<EquipmentItem>) => {
      return updateEquipmentItemMutation.mutateAsync({ id: itemId, updates });
    },
    
    addEquipmentItem: (newItem: Omit<EquipmentItem, 'id' | 'lastUpdated'>) => {
      return addEquipmentItemMutation.mutateAsync(newItem);
    },

    // Individual Equipment
    updateSingleIndividualEquipment: (equipmentId: string, updates: Partial<IndividualEquipment>) => {
      return updateIndividualEquipmentMutation.mutateAsync({ id: equipmentId, updates });
    },

    addIndividualEquipment: (newEquipment: Omit<IndividualEquipment, 'id' | 'lastUpdated'>) => {
      return addIndividualEquipmentMutation.mutateAsync(newEquipment);
    },

    addBulkIndividualEquipment: (equipment: Omit<IndividualEquipment, 'id' | 'lastUpdated'>[]) => {
      return addBulkIndividualEquipmentMutation.mutateAsync(equipment);
    },

    // Equipment Types
    createEquipmentType: (newType: Omit<EquipmentType, 'id'>) => {
      return createEquipmentTypeMutation.mutateAsync(newType);
    },

    updateEquipmentType: (typeId: string, updates: Partial<EquipmentType>) => {
      return updateEquipmentTypeMutation.mutateAsync({ id: typeId, updates });
    },

    deleteEquipmentType: (typeId: string) => {
      return deleteEquipmentTypeMutation.mutateAsync(typeId);
    },

    // Storage Locations
    createStorageLocation: (newLocation: Omit<StorageLocation, 'id'>) => {
      return createStorageLocationMutation.mutateAsync(newLocation);
    },

    updateStorageLocation: (locationId: string, updates: Partial<StorageLocation>) => {
      return updateStorageLocationMutation.mutateAsync({ id: locationId, updates });
    },

    deleteStorageLocation: (locationId: string) => {
      return deleteStorageLocationMutation.mutateAsync(locationId);
    },

    // Job Integration
    createJobStorageLocation,

    // Loading states
    isLoading: updateEquipmentItemMutation.isPending || 
               updateIndividualEquipmentMutation.isPending ||
               addEquipmentItemMutation.isPending ||
               addIndividualEquipmentMutation.isPending ||
               addBulkIndividualEquipmentMutation.isPending ||
               createEquipmentTypeMutation.isPending ||
               updateEquipmentTypeMutation.isPending ||
               deleteEquipmentTypeMutation.isPending ||
               createStorageLocationMutation.isPending ||
               updateStorageLocationMutation.isPending ||
               deleteStorageLocationMutation.isPending,
  };
};
