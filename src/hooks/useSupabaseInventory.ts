
import { useState } from 'react';
import { InventoryData } from '@/types/inventory';
import { useSupabaseEquipmentQueries } from './supabase/useSupabaseEquipmentQueries';
import { useSupabaseEquipmentMutations } from './supabase/useSupabaseEquipmentMutations';
import { useSupabaseEquipmentUtils } from './supabase/useSupabaseEquipmentUtils';

export const useSupabaseInventory = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    equipmentTypes,
    storageLocations,
    equipmentItems,
    individualEquipment,
    isLoading: queriesLoading
  } = useSupabaseEquipmentQueries();

  const mutations = useSupabaseEquipmentMutations();
  
  const utils = useSupabaseEquipmentUtils(equipmentItems, individualEquipment);

  // Combined data object
  const data: InventoryData = {
    equipmentTypes,
    storageLocations,
    equipmentItems,
    individualEquipment,
    lastSync: new Date(),
  };

  return {
    data,
    isLoading: queriesLoading || isLoading,
    syncStatus: 'synced' as const,
    
    // Mutations
    ...mutations,

    // Utilities
    ...utils,

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
