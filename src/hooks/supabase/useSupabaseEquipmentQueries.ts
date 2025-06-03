
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentType, StorageLocation, EquipmentItem, IndividualEquipment } from '@/types/inventory';

export const useSupabaseEquipmentQueries = () => {
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

  const isLoadingAny = typesLoading || locationsLoading || itemsLoading || individualLoading;

  return {
    equipmentTypes,
    storageLocations,
    equipmentItems,
    individualEquipment,
    isLoading: isLoadingAny,
  };
};
