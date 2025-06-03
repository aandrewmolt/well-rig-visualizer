
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { InventoryData, EquipmentType, StorageLocation, EquipmentItem, IndividualEquipment } from '@/types/inventory';

export const useSupabaseInventory = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Query for equipment types
  const { data: equipmentTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ['equipment-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_types')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) throw error;
      
      return data.map(type => ({
        id: type.id,
        name: type.name,
        category: type.category as 'cables' | 'gauges' | 'adapters' | 'communication' | 'other',
        description: type.description || undefined,
        requiresIndividualTracking: type.requires_individual_tracking,
        defaultIdPrefix: type.default_id_prefix || undefined,
      })) as EquipmentType[];
    }
  });

  // Query for storage locations
  const { data: storageLocations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ['storage-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('storage_locations')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      return data.map(location => ({
        id: location.id,
        name: location.name,
        address: location.address || undefined,
        isDefault: location.is_default,
      })) as StorageLocation[];
    }
  });

  // Query for equipment items
  const { data: equipmentItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['equipment-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        typeId: item.type_id,
        locationId: item.location_id,
        quantity: item.quantity,
        status: item.status as 'available' | 'deployed' | 'red-tagged',
        jobId: item.job_id || undefined,
        notes: item.notes || undefined,
        redTagReason: item.red_tag_reason || undefined,
        redTagPhoto: item.red_tag_photo || undefined,
        lastUpdated: new Date(item.updated_at),
      })) as EquipmentItem[];
    }
  });

  // Query for individual equipment
  const { data: individualEquipment = [], isLoading: individualLoading } = useQuery({
    queryKey: ['individual-equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('individual_equipment')
        .select('*')
        .order('equipment_id', { ascending: true });
      
      if (error) throw error;
      
      return data.map(equipment => ({
        id: equipment.id,
        equipmentId: equipment.equipment_id,
        name: equipment.name,
        typeId: equipment.type_id,
        locationId: equipment.location_id,
        status: equipment.status as 'available' | 'deployed' | 'maintenance' | 'red-tagged' | 'retired',
        jobId: equipment.job_id || undefined,
        serialNumber: equipment.serial_number || undefined,
        purchaseDate: equipment.purchase_date ? new Date(equipment.purchase_date) : undefined,
        warrantyExpiry: equipment.warranty_expiry ? new Date(equipment.warranty_expiry) : undefined,
        notes: equipment.notes || undefined,
        redTagReason: equipment.red_tag_reason || undefined,
        redTagPhoto: equipment.red_tag_photo || undefined,
        lastUpdated: new Date(equipment.updated_at),
      })) as IndividualEquipment[];
    }
  });

  // Combined data object
  const data: InventoryData = {
    equipmentTypes,
    storageLocations,
    equipmentItems,
    individualEquipment,
    lastSync: new Date(),
  };

  const isLoadingAny = typesLoading || locationsLoading || itemsLoading || individualLoading;

  // Mutations for updating data
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
    data,
    isLoading: isLoadingAny || isLoading,
    syncStatus: 'synced' as const,
    
    // Update operations
    updateSingleEquipmentItem: (itemId: string, updates: Partial<EquipmentItem>) => {
      updateEquipmentItemMutation.mutate({ id: itemId, updates });
    },
    
    updateSingleIndividualEquipment: (equipmentId: string, updates: Partial<IndividualEquipment>) => {
      updateIndividualEquipmentMutation.mutate({ id: equipmentId, updates });
    },

    // Add operations
    addEquipmentItem: (newItem: Omit<EquipmentItem, 'id' | 'lastUpdated'>) => {
      addEquipmentItemMutation.mutate(newItem);
    },

    addIndividualEquipment: (newEquipment: Omit<IndividualEquipment, 'id' | 'lastUpdated'>) => {
      addIndividualEquipmentMutation.mutate(newEquipment);
    },

    // Query functions
    getEquipmentByType: (typeId: string) => {
      return equipmentItems.filter(item => item.typeId === typeId);
    },

    getIndividualEquipmentByType: (typeId: string) => {
      return individualEquipment.filter(equipment => equipment.typeId === typeId);
    },

    getEquipmentByLocation: (locationId: string) => {
      return equipmentItems.filter(item => item.locationId === locationId);
    },

    getIndividualEquipmentByLocation: (locationId: string) => {
      return individualEquipment.filter(equipment => equipment.locationId === locationId);
    },

    // Legacy compatibility methods
    updateEquipmentTypes: () => {},
    updateStorageLocations: () => {},
    updateEquipmentItems: () => {},
    updateIndividualEquipment: () => {},
    syncData: async () => data,
    resetToDefaultInventory: () => {},
    cleanupDuplicateDeployments: () => equipmentItems,
  };
};
