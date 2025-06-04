
import { useEffect, useState } from 'react';
import { useSupabaseInventory } from './useSupabaseInventory';
import { toast } from 'sonner';

const DEFAULT_EQUIPMENT_TYPES = [
  { name: 'Customer Computer', category: 'communication' as const, description: 'Customer computer for job sites', requiresIndividualTracking: true, defaultIdPrefix: 'CC' },
  { name: 'Customer Tablet', category: 'communication' as const, description: 'Customer tablet for job sites', requiresIndividualTracking: true, defaultIdPrefix: 'CT' },
  { name: 'Starlink', category: 'communication' as const, description: 'Satellite internet equipment', requiresIndividualTracking: true, defaultIdPrefix: 'SL' },
  { name: 'ShearStream Box', category: 'communication' as const, description: 'Main streaming box', requiresIndividualTracking: true, defaultIdPrefix: 'SS' },
  { name: '100ft Cable', category: 'cables' as const, description: '100 foot cable', requiresIndividualTracking: false },
  { name: '200ft Cable', category: 'cables' as const, description: '200 foot cable', requiresIndividualTracking: false },
  { name: '300ft Cable (Old)', category: 'cables' as const, description: '300 foot cable - older version', requiresIndividualTracking: false },
  { name: '300ft Cable (New)', category: 'cables' as const, description: '300 foot cable - newer version', requiresIndividualTracking: false },
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
  const [initializationAttempted, setInitializationAttempted] = useState(false);

  useEffect(() => {
    const initializeDefaults = async () => {
      // Prevent multiple initialization attempts
      if (hasInitialized || isInitializing || initializationAttempted) {
        return;
      }

      // Check if we need to initialize
      const needsEquipmentTypes = data.equipmentTypes.length === 0;
      const needsStorageLocations = data.storageLocations.length === 0;
      
      // If we already have data, mark as initialized
      if (!needsEquipmentTypes && !needsStorageLocations) {
        setHasInitialized(true);
        setInitializationAttempted(true);
        return;
      }

      console.log('Starting default data initialization...');
      setIsInitializing(true);
      setInitializationAttempted(true);

      try {
        let successCount = 0;
        let skipCount = 0;

        // Create default storage location if none exist
        if (needsStorageLocations) {
          try {
            // Check if Main Warehouse already exists by name
            const existingMainWarehouse = data.storageLocations.find(
              loc => loc.name.toLowerCase() === DEFAULT_STORAGE_LOCATION.name.toLowerCase()
            );
            
            if (!existingMainWarehouse) {
              await createStorageLocation(DEFAULT_STORAGE_LOCATION);
              console.log('Created default storage location');
              successCount++;
            } else {
              console.log('Main Warehouse already exists, skipping creation');
              skipCount++;
            }
          } catch (error: any) {
            // Handle duplicate key violations gracefully
            if (error.message?.includes('duplicate key') || 
                error.message?.includes('already exists') ||
                error.message?.includes('violates unique constraint')) {
              console.log('Storage location already exists, continuing...');
              skipCount++;
            } else {
              console.error('Error creating storage location:', error);
              throw error;
            }
          }
        }

        // Create default equipment types if none exist
        if (needsEquipmentTypes) {
          for (const equipmentType of DEFAULT_EQUIPMENT_TYPES) {
            try {
              // Check if equipment type already exists by name
              const existingType = data.equipmentTypes.find(
                type => type.name.toLowerCase() === equipmentType.name.toLowerCase()
              );
              
              if (!existingType) {
                await createEquipmentType(equipmentType);
                console.log(`Created equipment type: ${equipmentType.name}`);
                successCount++;
              } else {
                console.log(`Equipment type '${equipmentType.name}' already exists, skipping...`);
                skipCount++;
              }
            } catch (error: any) {
              // Handle duplicate key violations gracefully
              if (error.message?.includes('duplicate key') || 
                  error.message?.includes('already exists') ||
                  error.message?.includes('violates unique constraint')) {
                console.log(`Equipment type '${equipmentType.name}' already exists, continuing...`);
                skipCount++;
              } else {
                console.error(`Error creating equipment type '${equipmentType.name}':`, error);
                // Continue with other types instead of failing completely
              }
            }
          }
        }

        setHasInitialized(true);
        
        // Show appropriate success message
        if (successCount > 0) {
          toast.success(`Successfully initialized ${successCount} default items${skipCount > 0 ? ` (${skipCount} already existed)` : ''}`);
        } else if (skipCount > 0) {
          console.log(`All default items already exist (${skipCount} items)`);
        }
        
        console.log('Default data initialization completed successfully');
      } catch (error) {
        console.error('Failed to initialize default data:', error);
        toast.error('Failed to create some default data. You may need to create equipment types and storage locations manually.');
        // Still mark as attempted to prevent infinite retries
        setHasInitialized(true);
      } finally {
        setIsInitializing(false);
      }
    };

    // Only run initialization if we have loaded data and need to initialize
    const hasLoadedData = data.equipmentTypes.length >= 0 && data.storageLocations.length >= 0;
    const needsInitialization = data.equipmentTypes.length === 0 || data.storageLocations.length === 0;
    
    if (hasLoadedData && needsInitialization && !initializationAttempted) {
      initializeDefaults();
    }
  }, [
    data.equipmentTypes.length, 
    data.storageLocations.length, 
    hasInitialized, 
    isInitializing, 
    initializationAttempted,
    createEquipmentType, 
    createStorageLocation, 
    data.equipmentTypes, 
    data.storageLocations
  ]);

  return {
    isInitializing,
    hasInitialized,
    needsInitialization: !hasInitialized && (data.equipmentTypes.length === 0 || data.storageLocations.length === 0)
  };
};
