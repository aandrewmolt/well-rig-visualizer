
import { useSupabaseInventory } from './useSupabaseInventory';
import { InventoryData, SyncStatus } from '@/types/inventory';

// Migration hook that provides the same interface as useInventoryData but uses Supabase
export const useSupabaseInventoryMigration = () => {
  const {
    data,
    isLoading,
    syncStatus = 'synced' as SyncStatus,
    updateSingleEquipmentItem,
    updateSingleIndividualEquipment,
    addEquipmentItem,
    addIndividualEquipment,
    getEquipmentByType,
    getIndividualEquipmentByType,
    getEquipmentByLocation,
    getIndividualEquipmentByLocation,
    // Legacy compatibility methods from useSupabaseInventory
    updateEquipmentTypes,
    updateStorageLocations,
    updateEquipmentItems,
    updateIndividualEquipment,
    syncData,
    resetToDefaultInventory,
    cleanupDuplicateDeployments,
  } = useSupabaseInventory();

  // Provide compatibility methods for components that expect the old interface
  return {
    data,
    isLoading,
    syncStatus,
    
    // Query functions
    getEquipmentByType,
    getIndividualEquipmentByType,
    getEquipmentByLocation,
    getIndividualEquipmentByLocation,
    
    // Update functions (mapped to new Supabase functions)
    updateSingleEquipmentItem,
    updateSingleIndividualEquipment,
    addEquipmentItem,
    addIndividualEquipment,
    
    // Legacy compatibility
    updateEquipmentTypes,
    updateStorageLocations,
    updateEquipmentItems,
    updateIndividualEquipment,
    syncData,
    resetToDefaultInventory,
    cleanupDuplicateDeployments,
  };
};

// Re-export types for backward compatibility
export type {
  EquipmentType,
  StorageLocation,
  EquipmentItem,
  IndividualEquipment,
  InventoryData
} from '@/types/inventory';
