
import { useState, useEffect } from 'react';
import { TrackedEquipment, EquipmentDeploymentHistory } from '@/types/equipment';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useTrackedEquipmentTypes } from './trackedEquipment/useTrackedEquipmentTypes';
import { useTrackedEquipmentSync } from './trackedEquipment/useTrackedEquipmentSync';
import { useTrackedEquipmentStorage } from './trackedEquipment/useTrackedEquipmentStorage';
import { useTrackedEquipmentOperations } from './trackedEquipment/useTrackedEquipmentOperations';

export const useTrackedEquipment = () => {
  const { data: inventoryData } = useInventoryData();
  const [trackedEquipment, setTrackedEquipment] = useState<TrackedEquipment[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<EquipmentDeploymentHistory[]>([]);

  const { createDefaultEquipment } = useTrackedEquipmentTypes();
  const { syncFromInventory, forceSyncFromInventory } = useTrackedEquipmentSync();
  const { loadData, saveData } = useTrackedEquipmentStorage();
  const operations = useTrackedEquipmentOperations(
    trackedEquipment,
    setTrackedEquipment,
    deploymentHistory,
    setDeploymentHistory
  );

  // Force sync function that can be called externally
  const performForceSyncFromInventory = () => {
    console.log('Performing force sync from inventory');
    const syncedEquipment = forceSyncFromInventory();
    setTrackedEquipment(syncedEquipment);
    return syncedEquipment;
  };

  // Load data on mount
  useEffect(() => {
    const historyData = loadData();
    setDeploymentHistory(historyData);
  }, []);

  // Sync from inventory with improved timing - trigger sync when individual equipment changes
  useEffect(() => {
    console.log('Inventory data change detected, checking for sync...');
    console.log('Individual equipment count:', inventoryData.individualEquipment.length);
    
    if (inventoryData.individualEquipment.length > 0) {
      // Use a slight delay to ensure all inventory operations are complete
      const timeoutId = setTimeout(() => {
        console.log('Executing delayed sync from inventory');
        const syncedEquipment = syncFromInventory();
        setTrackedEquipment(syncedEquipment);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else if (trackedEquipment.length === 0) {
      // Fallback to default equipment if no inventory data
      console.log('No inventory data, falling back to default equipment');
      setTrackedEquipment(createDefaultEquipment());
    }
  }, [inventoryData.individualEquipment, inventoryData.lastSync, inventoryData.equipmentTypes]); 

  // Save whenever tracked equipment or deployment history changes
  useEffect(() => {
    if (trackedEquipment.length > 0) {
      saveData(trackedEquipment, deploymentHistory);
    }
  }, [trackedEquipment, deploymentHistory]);

  return {
    trackedEquipment,
    deploymentHistory,
    forceSyncFromInventory: performForceSyncFromInventory,
    ...operations,
  };
};
