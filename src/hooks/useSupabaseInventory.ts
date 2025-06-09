
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
    isLoading: queriesLoading,
    refetch,
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

  // Enhanced mutation wrappers with better error handling
  const createEquipmentType = async (type: any) => {
    try {
      const result = await mutations.addEquipmentType(type);
      refetch.refetchEquipmentTypes();
      return result;
    } catch (error: any) {
      if (error.message?.includes('duplicate key') || 
          error.message?.includes('already exists') ||
          error.message?.includes('violates unique constraint')) {
        return null;
      }
      throw error;
    }
  };

  const createStorageLocation = async (location: any) => {
    try {
      const result = await mutations.addStorageLocation(location);
      refetch.refetchStorageLocations();
      return result;
    } catch (error: any) {
      if (error.message?.includes('duplicate key') || 
          error.message?.includes('already exists') ||
          error.message?.includes('violates unique constraint')) {
        return null;
      }
      throw error;
    }
  };

  const updateSingleEquipmentItem = async (id: string, updates: any) => {
    try {
      await mutations.updateEquipmentItem(id, updates);
      refetch.refetchEquipmentItems();
    } catch (error) {
      throw error;
    }
  };

  const addEquipmentItem = async (item: any) => {
    try {
      await mutations.addEquipmentItem(item);
      refetch.refetchEquipmentItems();
    } catch (error) {
      throw error;
    }
  };

  const deleteEquipmentItem = async (id: string) => {
    try {
      const result = await mutations.deleteEquipmentItem(id);
      refetch.refetchEquipmentItems();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const deleteEquipmentType = async (id: string) => {
    try {
      const result = await mutations.deleteEquipmentType(id);
      refetch.refetchEquipmentTypes();
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    data,
    isLoading: queriesLoading || isLoading || mutations.isLoading,
    syncStatus: 'synced' as const,
    
    // Enhanced CRUD operations with better error handling
    createEquipmentType,
    createStorageLocation,
    updateSingleEquipmentItem,
    addEquipmentItem,
    deleteEquipmentItem,
    deleteEquipmentType,
    
    // All mutation operations with proper aliases
    ...mutations,
    addIndividualEquipment: mutations.addIndividualEquipment,
    updateSingleIndividualEquipment: mutations.updateIndividualEquipment,
    
    // Bulk operations
    addBulkIndividualEquipment: async (equipment: any[]) => {
      try {
        const results = await Promise.all(
          equipment.map(eq => mutations.addIndividualEquipment(eq))
        );
        refetch.refetchIndividualEquipment();
        return results;
      } catch (error) {
        throw error;
      }
    },

    // Utilities
    ...utils,

    // Legacy compatibility methods
    updateEquipmentTypes: mutations.updateEquipmentType,
    updateStorageLocations: mutations.updateStorageLocation,
    updateEquipmentItems: mutations.updateEquipmentItem,
    updateIndividualEquipment: mutations.updateIndividualEquipment,
    syncData: async () => data,
    resetToDefaultInventory: () => {},
    cleanupDuplicateDeployments: () => equipmentItems,
    
    // Refetch methods for real-time updates
    refetch,
  };
};
