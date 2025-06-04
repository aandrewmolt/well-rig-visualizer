
import { useState, useEffect, useRef } from 'react';
import { InventoryData } from '@/types/inventory';
import { useSupabaseEquipmentQueries } from './supabase/useSupabaseEquipmentQueries';
import { useSupabaseEquipmentMutations } from './supabase/useSupabaseEquipmentMutations';
import { useSupabaseEquipmentUtils } from './supabase/useSupabaseEquipmentUtils';
import { supabase } from '@/integrations/supabase/client';

export const useSupabaseInventory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<any>(null);
  
  const {
    equipmentTypes,
    storageLocations,
    equipmentItems,
    individualEquipment,
    isLoading: queriesLoading,
    refetch
  } = useSupabaseEquipmentQueries();

  const mutations = useSupabaseEquipmentMutations();
  
  const utils = useSupabaseEquipmentUtils(equipmentItems, individualEquipment);

  // Set up real-time subscriptions only once
  useEffect(() => {
    if (channelRef.current) {
      return; // Already subscribed
    }

    console.log('Setting up real-time subscriptions for inventory...');
    
    const channel = supabase
      .channel('inventory-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_types' }, () => {
        console.log('Equipment types changed, refetching...');
        refetch.refetchEquipmentTypes();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'storage_locations' }, () => {
        console.log('Storage locations changed, refetching...');
        refetch.refetchStorageLocations();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_items' }, () => {
        console.log('Equipment items changed, refetching...');
        refetch.refetchEquipmentItems();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'individual_equipment' }, () => {
        console.log('Individual equipment changed, refetching...');
        refetch.refetchIndividualEquipment();
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      console.log('Cleaning up real-time subscriptions...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []); // Empty dependency array to run only once

  // Combined data object
  const data: InventoryData = {
    equipmentTypes,
    storageLocations,
    equipmentItems,
    individualEquipment,
    lastSync: new Date(),
  };

  // Enhanced mutation wrappers with proper error handling
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
    
    // Enhanced CRUD operations
    updateSingleEquipmentItem,
    addEquipmentItem,
    deleteEquipmentItem,
    deleteEquipmentType,
    
    // All mutation operations with proper aliases
    ...mutations,
    createEquipmentType: mutations.addEquipmentType,
    createStorageLocation: mutations.addStorageLocation,
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

    // Legacy compatibility methods (now implemented)
    updateEquipmentTypes: mutations.updateEquipmentType,
    updateStorageLocations: mutations.updateStorageLocation,
    updateEquipmentItems: mutations.updateEquipmentItem,
    updateIndividualEquipment: mutations.updateIndividualEquipment,
    syncData: async () => data,
    resetToDefaultInventory: () => {},
    cleanupDuplicateDeployments: () => equipmentItems,
  };
};
