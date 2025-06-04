
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentType, StorageLocation, EquipmentItem, IndividualEquipment } from '@/types/inventory';

export const useSupabaseEquipmentQueries = () => {
  const equipmentTypesQuery = useQuery({
    queryKey: ['equipment-types'],
    queryFn: async (): Promise<EquipmentType[]> => {
      const { data, error } = await supabase
        .from('equipment_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description || undefined,
        requiresIndividualTracking: item.requires_individual_tracking,
        defaultIdPrefix: item.default_id_prefix || undefined
      }));
    }
  });

  const storageLocationsQuery = useQuery({
    queryKey: ['storage-locations'],
    queryFn: async (): Promise<StorageLocation[]> => {
      const { data, error } = await supabase
        .from('storage_locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        address: item.address || undefined,
        isDefault: item.is_default
      }));
    }
  });

  const equipmentItemsQuery = useQuery({
    queryKey: ['equipment-items'],
    queryFn: async (): Promise<EquipmentItem[]> => {
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
        status: item.status as any,
        jobId: item.job_id || undefined,
        notes: item.notes || undefined,
        redTagReason: item.red_tag_reason || undefined,
        redTagPhoto: item.red_tag_photo || undefined,
        location_type: item.location_type || 'storage',
        lastUpdated: new Date(item.updated_at)
      }));
    }
  });

  const individualEquipmentQuery = useQuery({
    queryKey: ['individual-equipment'],
    queryFn: async (): Promise<IndividualEquipment[]> => {
      const { data, error } = await supabase
        .from('individual_equipment')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        equipmentId: item.equipment_id,
        name: item.name,
        typeId: item.type_id,
        locationId: item.location_id,
        status: item.status as any,
        jobId: item.job_id || undefined,
        serialNumber: item.serial_number || undefined,
        purchaseDate: item.purchase_date ? new Date(item.purchase_date) : undefined,
        warrantyExpiry: item.warranty_expiry ? new Date(item.warranty_expiry) : undefined,
        notes: item.notes || undefined,
        redTagReason: item.red_tag_reason || undefined,
        redTagPhoto: item.red_tag_photo || undefined,
        location_type: item.location_type || 'storage',
        lastUpdated: new Date(item.updated_at)
      }));
    }
  });

  const isLoading = equipmentTypesQuery.isLoading || 
                   storageLocationsQuery.isLoading || 
                   equipmentItemsQuery.isLoading || 
                   individualEquipmentQuery.isLoading;

  return {
    equipmentTypes: equipmentTypesQuery.data || [],
    storageLocations: storageLocationsQuery.data || [],
    equipmentItems: equipmentItemsQuery.data || [],
    individualEquipment: individualEquipmentQuery.data || [],
    isLoading,
    
    // Refetch methods for real-time updates
    refetch: {
      refetchEquipmentTypes: equipmentTypesQuery.refetch,
      refetchStorageLocations: storageLocationsQuery.refetch,
      refetchEquipmentItems: equipmentItemsQuery.refetch,
      refetchIndividualEquipment: individualEquipmentQuery.refetch,
      refetchAll: () => {
        equipmentTypesQuery.refetch();
        storageLocationsQuery.refetch();
        equipmentItemsQuery.refetch();
        individualEquipmentQuery.refetch();
      }
    }
  };
};
