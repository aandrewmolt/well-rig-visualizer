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
      return await mutations.addEquipmentType(type);
    } catch (error: any) {
      // Don't throw for expected duplicate errors during initialization
      if (error.message?.includes('duplicate key') || 
          error.message?.includes('already exists') ||
          error.message?.includes('violates unique constraint')) {
        console.log(`Equipment type '${type.name}' already exists, skipping...`);
        return null;
      }
      console.error('Failed to create equipment type:', error);
      throw error;
    }
  };

  const createStorageLocation = async (location: any) => {
    try {
      return await mutations.addStorageLocation(location);
    } catch (error: any) {
      // Don't throw for expected duplicate errors during initialization
      if (error.message?.includes('duplicate key') || 
          error.message?.includes('already exists') ||
          error.message?.includes('violates unique constraint')) {
        console.log(`Storage location '${location.name}' already exists, skipping...`);
        return null;
      }
      console.error('Failed to create storage location:', error);
      throw error;
    }
  };

  const updateSingleEquipmentItem = async (id: string, updates: any) => {
    try {
      await mutations.updateEquipmentItem(id, updates);
    } catch (error) {
      console.error('Failed to update equipment item:', error);
      throw error;
    }
  };

  const addEquipmentItem = async (item: any) => {
    try {
      await mutations.addEquipmentItem(item);
    } catch (error) {
      console.error('Failed to add equipment item:', error);
      throw error;
    }
  };

  const deleteEquipmentItem = async (id: string) => {
    try {
      return await mutations.deleteEquipmentItem(id);
    } catch (error) {
      console.error('Failed to delete equipment item:', error);
      throw error;
    }
  };

  const deleteEquipmentType = async (id: string) => {
    try {
      return await mutations.deleteEquipmentType(id);
    } catch (error) {
      console.error('Failed to delete equipment type:', error);
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
        return results;
      } catch (error) {
        console.error('Failed to add bulk individual equipment:', error);
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
  };
};
