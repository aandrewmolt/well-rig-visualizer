
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

      // Check if we need to initialize - be more specific about what we're checking
      const hasRequiredTypes = DEFAULT_EQUIPMENT_TYPES.every(defaultType => 
        data.equipmentTypes.some(existingType => 
          existingType.name.toLowerCase().trim() === defaultType.name.toLowerCase().trim()
        )
      );
      
      const hasDefaultLocation = data.storageLocations.some(loc => 
        loc.name.toLowerCase().trim() === DEFAULT_STORAGE_LOCATION.name.toLowerCase().trim() || 
        loc.isDefault
      );
      
      // If we already have all required data, mark as initialized
      if (hasRequiredTypes && hasDefaultLocation) {
        console.log('All required default data already exists, skipping initialization');
        setHasInitialized(true);
        setInitializationAttempted(true);
        return;
      }

      console.log('Starting selective default data initialization...');
      setIsInitializing(true);
      setInitializationAttempted(true);

      try {
        let successCount = 0;
        let skipCount = 0;

        // Create default storage location if needed
        if (!hasDefaultLocation) {
          try {
            const existingMainWarehouse = data.storageLocations.find(
              loc => loc.name.toLowerCase().trim() === DEFAULT_STORAGE_LOCATION.name.toLowerCase().trim()
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
            if (error.message?.includes('duplicate key') || 
                error.message?.includes('already exists') ||
                error.message?.includes('violates unique constraint')) {
              console.log('Storage location already exists (caught duplicate), continuing...');
              skipCount++;
            } else {
              console.error('Unexpected error creating storage location:', error);
            }
          }
        }

        // Create missing equipment types only
        const missingTypes = DEFAULT_EQUIPMENT_TYPES.filter(defaultType => 
          !data.equipmentTypes.some(existingType => 
            existingType.name.toLowerCase().trim() === defaultType.name.toLowerCase().trim()
          )
        );

        if (missingTypes.length > 0) {
          console.log(`Found ${missingTypes.length} missing equipment types to create:`, missingTypes.map(t => t.name));
          
          for (const equipmentType of missingTypes) {
            try {
              await createEquipmentType(equipmentType);
              console.log(`Successfully created equipment type: ${equipmentType.name}`);
              successCount++;
              
              // Small delay to prevent overwhelming the database
              await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error: any) {
              if (error.message?.includes('duplicate key') || 
                  error.message?.includes('already exists') ||
                  error.message?.includes('violates unique constraint')) {
                console.log(`Equipment type '${equipmentType.name}' already exists (caught duplicate), continuing...`);
                skipCount++;
              } else {
                console.error(`Unexpected error creating equipment type '${equipmentType.name}':`, error);
              }
            }
          }
        } else {
          console.log('All required equipment types already exist');
        }

        setHasInitialized(true);
        
        // Show appropriate success message
        if (successCount > 0) {
          toast.success(`Successfully initialized ${successCount} default items${skipCount > 0 ? ` (${skipCount} already existed)` : ''}`);
        } else if (skipCount > 0) {
          console.log(`All default items already exist (${skipCount} items checked)`);
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

    // Only run initialization if we have loaded data and might need to initialize
    const hasLoadedData = Array.isArray(data.equipmentTypes) && Array.isArray(data.storageLocations);
    
    if (hasLoadedData && !initializationAttempted) {
      initializeDefaults();
    }
  }, [
    data.equipmentTypes, 
    data.storageLocations, 
    hasInitialized, 
    isInitializing, 
    initializationAttempted,
    createEquipmentType, 
    createStorageLocation
  ]);

  return {
    isInitializing,
    hasInitialized,
    needsInitialization: !hasInitialized && !initializationAttempted
  };
};
