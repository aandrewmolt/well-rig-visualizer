
import React, { createContext, useContext, useState } from 'react';
import { InventoryData } from '@/types/inventory';
import { useSupabaseEquipmentQueries } from '@/hooks/supabase/useSupabaseEquipmentQueries';
import { useSupabaseEquipmentUtils } from '@/hooks/supabase/useSupabaseEquipmentUtils';
import { InventoryContextType } from './inventory/InventoryContextTypes';
import { useInventoryMutations } from './inventory/useInventoryMutations';
import { useInventoryUtils } from './inventory/useInventoryUtils';
import { useInventoryRealtime } from './inventory/useInventoryRealtime';

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    equipmentTypes,
    storageLocations,
    equipmentItems,
    individualEquipment,
    isLoading: queriesLoading,
    refetch
  } = useSupabaseEquipmentQueries();

  const supabaseUtils = useSupabaseEquipmentUtils(equipmentItems, individualEquipment);
  const mutations = useInventoryMutations(storageLocations);
  const utils = useInventoryUtils(equipmentTypes, storageLocations, equipmentItems);
  
  // Set up real-time subscriptions
  useInventoryRealtime(refetch);

  // Combined data object
  const data: InventoryData = {
    equipmentTypes,
    storageLocations,
    equipmentItems,
    individualEquipment,
    lastSync: new Date(),
  };

  const contextValue: InventoryContextType = {
    data,
    isLoading: queriesLoading || isLoading || mutations.isLoading,
    syncStatus: 'synced' as const,
    
    // Enhanced CRUD operations
    updateSingleEquipmentItem: mutations.updateSingleEquipmentItem,
    addEquipmentItem: mutations.addEquipmentItem,
    deleteEquipmentItem: mutations.deleteEquipmentItem,
    deleteEquipmentType: mutations.deleteEquipmentType,
    deleteStorageLocation: mutations.deleteStorageLocation,
    deleteIndividualEquipment: mutations.deleteIndividualEquipment,
    
    // All mutation operations with proper wrapper functions
    addEquipmentType: mutations.addEquipmentTypeWrapper,
    updateEquipmentType: mutations.updateEquipmentTypeWrapper,
    addStorageLocation: mutations.addStorageLocationWrapper,
    updateStorageLocation: mutations.updateStorageLocationWithDefault,
    addIndividualEquipment: mutations.addIndividualEquipmentWrapper,
    updateIndividualEquipment: mutations.updateIndividualEquipmentWrapper,
    
    // Legacy compatibility
    createEquipmentType: mutations.addEquipmentTypeWrapper,
    createStorageLocation: mutations.addStorageLocationWrapper,
    updateSingleIndividualEquipment: mutations.updateIndividualEquipmentWrapper,
    
    // Bulk operations
    addBulkIndividualEquipment: mutations.addBulkIndividualEquipment,

    // Utilities - combine both utils
    ...supabaseUtils,
    ...utils,

    // Legacy compatibility methods
    updateEquipmentTypes: mutations.updateEquipmentTypeWrapper,
    updateStorageLocations: mutations.updateStorageLocationWithDefault,
    updateEquipmentItems: mutations.updateEquipmentItemWrapper,
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
