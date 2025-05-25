
import { useState } from 'react';
import { InventoryData, EquipmentType, StorageLocation, EquipmentItem, IndividualEquipment } from '@/types/inventory';
import { useInventoryStorage } from './useInventoryStorage';

export const useInventoryOperations = (
  data: InventoryData,
  setData: (data: InventoryData) => void
) => {
  const { saveToLocalStorage } = useInventoryStorage();

  const updateEquipmentTypes = (types: EquipmentType[]) => {
    const updatedData = { ...data, equipmentTypes: types, lastSync: new Date() };
    setData(updatedData);
    saveToLocalStorage(updatedData);
  };

  const updateStorageLocations = (locations: StorageLocation[]) => {
    const updatedData = { ...data, storageLocations: locations, lastSync: new Date() };
    setData(updatedData);
    saveToLocalStorage(updatedData);
  };

  const updateEquipmentItems = (items: EquipmentItem[]) => {
    // Removed redundant cleanup calls - these should be handled at initialization only
    const updatedData = { 
      ...data, 
      equipmentItems: items,
      lastSync: new Date()
    };
    setData(updatedData);
    saveToLocalStorage(updatedData);
  };

  const updateIndividualEquipment = (equipment: IndividualEquipment[]) => {
    const updatedData = { 
      ...data, 
      individualEquipment: equipment,
      lastSync: new Date()
    };
    setData(updatedData);
    saveToLocalStorage(updatedData);
  };

  const updateSingleEquipmentItem = (itemId: string, updates: Partial<EquipmentItem>) => {
    const updatedItems = data.equipmentItems.map(item =>
      item.id === itemId
        ? { ...item, ...updates, lastUpdated: new Date() }
        : item
    );
    updateEquipmentItems(updatedItems);
  };

  const updateSingleIndividualEquipment = (equipmentId: string, updates: Partial<IndividualEquipment>) => {
    const updatedEquipment = data.individualEquipment.map(equipment =>
      equipment.id === equipmentId
        ? { ...equipment, ...updates, lastUpdated: new Date() }
        : equipment
    );
    updateIndividualEquipment(updatedEquipment);
  };

  return {
    updateEquipmentTypes,
    updateStorageLocations,
    updateEquipmentItems,
    updateIndividualEquipment,
    updateSingleEquipmentItem,
    updateSingleIndividualEquipment,
  };
};
