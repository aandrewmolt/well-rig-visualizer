
import { useEffect, useState } from 'react';
import { useSupabaseInventory } from './useSupabaseInventory';
import { toast } from 'sonner';

const DEFAULT_EQUIPMENT_TYPES = [
  { name: 'Customer Computer', category: 'Equipment', description: 'Customer computer for job sites', requiresIndividualTracking: false },
  { name: 'Starlink', category: 'Equipment', description: 'Satellite internet equipment', requiresIndividualTracking: true, defaultIdPrefix: 'STL' },
  { name: 'ShearStream Box', category: 'Equipment', description: 'Main streaming box', requiresIndividualTracking: true, defaultIdPrefix: 'SSB' },
  { name: '100ft Cable', category: 'Cables', description: '100 foot cable', requiresIndividualTracking: false },
  { name: '200ft Cable', category: 'Cables', description: '200 foot cable', requiresIndividualTracking: false },
  { name: '300ft Cable', category: 'Cables', description: '300 foot cable', requiresIndividualTracking: false },
  { name: '1502 Pressure Gauge', category: 'Equipment', description: 'Pressure gauge for monitoring', requiresIndividualTracking: true, defaultIdPrefix: 'PG' },
  { name: 'Y Adapter Cable', category: 'Cables', description: 'Y adapter cable', requiresIndividualTracking: false }
];

const DEFAULT_STORAGE_LOCATION = {
  name: 'Main Warehouse',
  address: 'Primary storage facility',
  isDefault: true
};

export const useDefaultDataSetup = () => {
  const { data, createEquipmentType, createStorageLocation } = useSupabaseInventory();
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const initializeDefaults = async () => {
      // Don't run if we already have data or if we're already initializing
      if (hasInitialized || isInitializing || data.equipmentTypes.length > 0 || data.storageLocations.length > 0) {
        return;
      }

      setIsInitializing(true);
      console.log('Initializing default data...');

      try {
        // Create default storage location first
        console.log('Creating default storage location...');
        await createStorageLocation(DEFAULT_STORAGE_LOCATION);

        // Create default equipment types
        console.log('Creating default equipment types...');
        for (const equipmentType of DEFAULT_EQUIPMENT_TYPES) {
          await createEquipmentType(equipmentType);
        }

        setHasInitialized(true);
        toast.success('Default equipment types and storage location created successfully');
        console.log('Default data initialization completed');
      } catch (error) {
        console.error('Failed to initialize default data:', error);
        toast.error('Failed to create default data. Please create equipment types and storage locations manually.');
      } finally {
        setIsInitializing(false);
      }
    };

    // Only run initialization if we have no data
    if (data.equipmentTypes.length === 0 && data.storageLocations.length === 0 && !isInitializing && !hasInitialized) {
      initializeDefaults();
    }
  }, [data.equipmentTypes.length, data.storageLocations.length, hasInitialized, isInitializing, createEquipmentType, createStorageLocation]);

  return {
    isInitializing,
    hasInitialized,
    needsInitialization: data.equipmentTypes.length === 0 || data.storageLocations.length === 0
  };
};
