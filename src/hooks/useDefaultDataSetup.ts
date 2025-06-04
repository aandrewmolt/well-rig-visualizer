
import { useEffect, useState } from 'react';
import { useSupabaseInventory } from './useSupabaseInventory';
import { toast } from 'sonner';

const DEFAULT_EQUIPMENT_TYPES = [
  { name: 'Customer Computer', category: 'communication' as const, description: 'Customer computer for job sites', requiresIndividualTracking: false },
  { name: 'Starlink', category: 'communication' as const, description: 'Satellite internet equipment', requiresIndividualTracking: true, defaultIdPrefix: 'STL' },
  { name: 'ShearStream Box', category: 'communication' as const, description: 'Main streaming box', requiresIndividualTracking: true, defaultIdPrefix: 'SSB' },
  { name: '100ft Cable', category: 'cables' as const, description: '100 foot cable', requiresIndividualTracking: false },
  { name: '200ft Cable', category: 'cables' as const, description: '200 foot cable', requiresIndividualTracking: false },
  { name: '300ft Cable', category: 'cables' as const, description: '300 foot cable', requiresIndividualTracking: false },
  { name: '1502 Pressure Gauge', category: 'gauges' as const, description: 'Pressure gauge for monitoring', requiresIndividualTracking: true, defaultIdPrefix: 'PG' },
  { name: 'Y Adapter Cable', category: 'adapters' as const, description: 'Y adapter cable', requiresIndividualTracking: false }
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
      // Only run if we have no data and haven't already initialized
      if (hasInitialized || isInitializing) {
        return;
      }

      const hasEquipmentTypes = data.equipmentTypes.length > 0;
      const hasStorageLocations = data.storageLocations.length > 0;

      // If we already have data, mark as initialized and don't create defaults
      if (hasEquipmentTypes && hasStorageLocations) {
        setHasInitialized(true);
        return;
      }

      setIsInitializing(true);
      console.log('Initializing default data...');

      try {
        // Create default storage location if none exist
        if (!hasStorageLocations) {
          console.log('Creating default storage location...');
          const existingLocation = data.storageLocations.find(loc => loc.name === DEFAULT_STORAGE_LOCATION.name);
          if (!existingLocation) {
            await createStorageLocation(DEFAULT_STORAGE_LOCATION);
          }
        }

        // Create default equipment types if none exist
        if (!hasEquipmentTypes) {
          console.log('Creating default equipment types...');
          for (const equipmentType of DEFAULT_EQUIPMENT_TYPES) {
            const existingType = data.equipmentTypes.find(type => type.name === equipmentType.name);
            if (!existingType) {
              try {
                await createEquipmentType(equipmentType);
              } catch (error: any) {
                // Skip if already exists (duplicate key error)
                if (!error.message?.includes('duplicate key') && !error.message?.includes('already exists')) {
                  throw error;
                }
                console.log(`Equipment type '${equipmentType.name}' already exists, skipping...`);
              }
            }
          }
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

    // Only initialize if we don't have both types of data
    if ((data.equipmentTypes.length === 0 || data.storageLocations.length === 0) && !isInitializing && !hasInitialized) {
      initializeDefaults();
    }
  }, [data.equipmentTypes.length, data.storageLocations.length, hasInitialized, isInitializing, createEquipmentType, createStorageLocation, data.equipmentTypes, data.storageLocations]);

  return {
    isInitializing,
    hasInitialized,
    needsInitialization: data.equipmentTypes.length === 0 || data.storageLocations.length === 0
  };
};
