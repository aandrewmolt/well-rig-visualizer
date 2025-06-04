import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentType, StorageLocation, EquipmentItem, IndividualEquipment } from '@/types/inventory';

// Default equipment types with proper individual tracking
const DEFAULT_EQUIPMENT_TYPES: Omit<EquipmentType, 'id'>[] = [
  {
    name: 'Customer Computer',
    category: 'communication',
    description: 'Customer computers and tablets for data collection',
    requiresIndividualTracking: true,
    defaultIdPrefix: 'CC'
  },
  {
    name: 'Starlink',
    category: 'communication',
    description: 'Satellite communication equipment',
    requiresIndividualTracking: true,
    defaultIdPrefix: 'SL'
  },
  {
    name: 'ShearStream Box',
    category: 'communication',
    description: 'Main data collection unit',
    requiresIndividualTracking: true,
    defaultIdPrefix: 'SS'
  },
  {
    name: '100ft Cable',
    category: 'cables',
    description: '100 foot cables',
    requiresIndividualTracking: false,
    defaultIdPrefix: 'C100'
  },
  {
    name: '200ft Cable',
    category: 'cables',
    description: '200 foot cables',
    requiresIndividualTracking: false,
    defaultIdPrefix: 'C200'
  },
  {
    name: '300ft Cable',
    category: 'cables',
    description: '300 foot cables',
    requiresIndividualTracking: false,
    defaultIdPrefix: 'C300'
  },
  {
    name: '1502 Pressure Gauge',
    category: 'gauges',
    description: 'Wellside pressure monitoring gauge',
    requiresIndividualTracking: true,
    defaultIdPrefix: 'PG'
  },
  {
    name: 'Y Adapter Cable',
    category: 'adapters',
    description: 'Cable splitter adapter',
    requiresIndividualTracking: false,
    defaultIdPrefix: 'YA'
  }
];

export const useSupabaseEquipmentQueries = () => {
  // Query for equipment types with automatic creation of defaults
  const { data: equipmentTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ['equipment-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_types')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) throw error;
      
      const existingTypes = data.map(type => ({
        id: type.id,
        name: type.name,
        category: type.category as 'cables' | 'gauges' | 'adapters' | 'communication' | 'other',
        description: type.description || undefined,
        requiresIndividualTracking: type.requires_individual_tracking,
        defaultIdPrefix: type.default_id_prefix || undefined,
      })) as EquipmentType[];

      // Check if we need to create default types
      const missingTypes = DEFAULT_EQUIPMENT_TYPES.filter(defaultType => 
        !existingTypes.some(existing => existing.name === defaultType.name)
      );

      if (missingTypes.length > 0) {
        console.log('Creating missing equipment types:', missingTypes);
        const { error: insertError } = await supabase
          .from('equipment_types')
          .insert(missingTypes.map(type => ({
            name: type.name,
            category: type.category,
            description: type.description,
            requires_individual_tracking: type.requiresIndividualTracking,
            default_id_prefix: type.defaultIdPrefix,
          })));

        if (insertError) {
          console.error('Error creating default equipment types:', insertError);
        } else {
          // Refetch to get the complete list with IDs
          const { data: updatedData, error: refetchError } = await supabase
            .from('equipment_types')
            .select('*')
            .order('category', { ascending: true });

          if (!refetchError && updatedData) {
            return updatedData.map(type => ({
              id: type.id,
              name: type.name,
              category: type.category as 'cables' | 'gauges' | 'adapters' | 'communication' | 'other',
              description: type.description || undefined,
              requiresIndividualTracking: type.requires_individual_tracking,
              defaultIdPrefix: type.default_id_prefix || undefined,
            })) as EquipmentType[];
          }
        }
      }
      
      return existingTypes;
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
