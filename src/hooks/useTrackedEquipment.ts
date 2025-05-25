
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
  const { syncFromInventory } = useTrackedEquipmentSync();
  const { loadData, saveData } = useTrackedEquipmentStorage();
  const operations = useTrackedEquipmentOperations(
    trackedEquipment,
    setTrackedEquipment,
    deploymentHistory,
    setDeploymentHistory
  );

  // Force sync function that can be called externally
  const forceSyncFromInventory = () => {
    console.log('Force syncing tracked equipment from inventory');
    const syncedEquipment = syncFromInventory();
    setTrackedEquipment(syncedEquipment);
  };

  // Load data and sync on mount
  useEffect(() => {
    const historyData = loadData();
    setDeploymentHistory(historyData);
  }, []);

  // Sync from inventory whenever inventory data changes - trigger sync when individual equipment changes
  useEffect(() => {
    console.log('Inventory data change detected, checking for sync...');
    console.log('Individual equipment count:', inventoryData.individualEquipment.length);
    
    if (inventoryData.individualEquipment.length > 0) {
      const syncedEquipment = syncFromInventory();
      setTrackedEquipment(syncedEquipment);
    } else if (trackedEquipment.length === 0) {
      // Fallback to default equipment if no inventory data
      console.log('No inventory data, falling back to default equipment');
      setTrackedEquipment(createDefaultEquipment());
    }
  }, [inventoryData.individualEquipment, inventoryData.lastSync]); // Added lastSync to trigger sync when equipment is saved

  // Save whenever tracked equipment or deployment history changes
  useEffect(() => {
    if (trackedEquipment.length > 0) {
      saveData(trackedEquipment, deploymentHistory);
    }
  }, [trackedEquipment, deploymentHistory]);

  return {
    trackedEquipment,
    deploymentHistory,
    forceSyncFromInventory,
    ...operations,
  };
};
