
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { InventoryData } from '@/types/inventory';
import { useSupabaseEquipmentQueries } from '@/hooks/supabase/useSupabaseEquipmentQueries';
import { useSupabaseEquipmentMutations } from '@/hooks/supabase/useSupabaseEquipmentMutations';
import { useSupabaseEquipmentUtils } from '@/hooks/supabase/useSupabaseEquipmentUtils';
import { supabase } from '@/integrations/supabase/client';

interface InventoryContextType {
  data: InventoryData;
  isLoading: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
  
  // CRUD operations
  updateSingleEquipmentItem: (id: string, updates: any) => Promise<void>;
  addEquipmentItem: (item: any) => Promise<void>;
  deleteEquipmentItem: (id: string) => Promise<any>;
  deleteEquipmentType: (id: string) => Promise<any>;
  
  // All mutation operations
  addEquipmentType: (data: any) => Promise<void>;
  updateEquipmentType: (id: string, data: any) => Promise<void>;
  addStorageLocation: (data: any) => Promise<void>;
  updateStorageLocation: (id: string, data: any) => Promise<void>;
  addIndividualEquipment: (data: any) => Promise<void>;
  updateIndividualEquipment: (id: string, data: any) => Promise<void>;
  
  // Bulk operations
  addBulkIndividualEquipment: (equipment: any[]) => Promise<any[]>;
  
  // Utilities and other methods
  getEquipmentTypeName: (typeId: string) => string;
  getLocationName: (locationId: string) => string;
  getEquipmentByLocation: (locationId: string) => any[];
  getIndividualEquipmentByLocation: (locationId: string) => any[];
  getTotalQuantityByType: (typeId: string) => number;
  getAvailableQuantityByType: (typeId: string) => number;
  getDeployedQuantityByType: (typeId: string) => number;
  
  // Legacy compatibility
  createEquipmentType: (data: any) => Promise<void>;
  createStorageLocation: (data: any) => Promise<void>;
  updateSingleIndividualEquipment: (id: string, data: any) => Promise<void>;
  updateEquipmentTypes: (id: string, data: any) => Promise<void>;
  updateStorageLocations: (id: string, data: any) => Promise<void>;
  updateEquipmentItems: (id: string, data: any) => Promise<void>;
  syncData: () => Promise<InventoryData>;
  resetToDefaultInventory: () => void;
  cleanupDuplicateDeployments: () => any[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const isInitializedRef = useRef(false);
  
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

  // Set up real-time subscriptions only once per app lifecycle
  useEffect(() => {
    if (isSubscribedRef.current || channelRef.current || isInitializedRef.current) {
      return;
    }

    console.log('Setting up centralized real-time subscriptions...');
    isInitializedRef.current = true;
    
    const channel = supabase
      .channel('inventory-changes-global')
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
      });

    channel.subscribe((status) => {
      console.log('Global subscription status:', status);
      if (status === 'SUBSCRIBED') {
        isSubscribedRef.current = true;
      }
    });

    channelRef.current = channel;

    return () => {
      console.log('Cleaning up centralized real-time subscriptions...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
        isInitializedRef.current = false;
      }
    };
  }, []);

  // Combined data object
  const data: InventoryData = {
    equipmentTypes,
    storageLocations,
    equipmentItems,
    individualEquipment,
    lastSync: new Date(),
  };

  // Enhanced mutation wrappers
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

  const addBulkIndividualEquipment = async (equipment: any[]) => {
    try {
      const results = await Promise.all(
        equipment.map(eq => mutations.addIndividualEquipment(eq))
      );
      return results;
    } catch (error) {
      console.error('Failed to add bulk individual equipment:', error);
      throw error;
    }
  };

  // Wrapper functions to ensure Promise<void> return type
  const addEquipmentTypeWrapper = async (data: any): Promise<void> => {
    await mutations.addEquipmentType(data);
  };

  const updateEquipmentTypeWrapper = async (id: string, data: any): Promise<void> => {
    await mutations.updateEquipmentType(id, data);
  };

  const addStorageLocationWrapper = async (data: any): Promise<void> => {
    await mutations.addStorageLocation(data);
  };

  const updateStorageLocationWrapper = async (id: string, data: any): Promise<void> => {
    await mutations.updateStorageLocation(id, data);
  };

  const addIndividualEquipmentWrapper = async (data: any): Promise<void> => {
    await mutations.addIndividualEquipment(data);
  };

  const updateIndividualEquipmentWrapper = async (id: string, data: any): Promise<void> => {
    await mutations.updateIndividualEquipment(id, data);
  };

  const updateEquipmentItemWrapper = async (id: string, data: any): Promise<void> => {
    await mutations.updateEquipmentItem(id, data);
  };

  const contextValue: InventoryContextType = {
    data,
    isLoading: queriesLoading || isLoading || mutations.isLoading,
    syncStatus: 'synced' as const,
    
    // Enhanced CRUD operations
    updateSingleEquipmentItem,
    addEquipmentItem,
    deleteEquipmentItem,
    deleteEquipmentType,
    
    // All mutation operations with proper wrapper functions
    addEquipmentType: addEquipmentTypeWrapper,
    updateEquipmentType: updateEquipmentTypeWrapper,
    addStorageLocation: addStorageLocationWrapper,
    updateStorageLocation: updateStorageLocationWrapper,
    addIndividualEquipment: addIndividualEquipmentWrapper,
    updateIndividualEquipment: updateIndividualEquipmentWrapper,
    
    // Legacy compatibility
    createEquipmentType: addEquipmentTypeWrapper,
    createStorageLocation: addStorageLocationWrapper,
    updateSingleIndividualEquipment: updateIndividualEquipmentWrapper,
    
    // Bulk operations
    addBulkIndividualEquipment,

    // Utilities
    ...utils,

    // Legacy compatibility methods
    updateEquipmentTypes: updateEquipmentTypeWrapper,
    updateStorageLocations: updateStorageLocationWrapper,
    updateEquipmentItems: updateEquipmentItemWrapper,
    syncData: async () => data,
    resetToDefaultInventory: () => {},
    cleanupDuplicateDeployments: () => equipmentItems,
  };

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
