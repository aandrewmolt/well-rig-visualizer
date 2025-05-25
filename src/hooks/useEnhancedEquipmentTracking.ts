
import { useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useInventoryData } from './useInventoryData';
import { toast } from 'sonner';
import { useEquipmentUsageCalculator, EquipmentUsage } from './equipment/useEquipmentUsageCalculator';
import { useEquipmentTypeManager } from './equipment/useEquipmentTypeManager';
import { useEquipmentAllocator } from './equipment/useEquipmentAllocator';
import { useEquipmentReturner } from './equipment/useEquipmentReturner';

export const useEnhancedEquipmentTracking = (jobId: string, nodes: Node[], edges: Edge[]) => {
  const { data, updateEquipmentItems } = useInventoryData();
  // Default to false to prevent automatic allocation
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);

  // Use the smaller, focused hooks
  const { calculateEquipmentUsage } = useEquipmentUsageCalculator(nodes, edges);
  const { ensureEquipmentTypesExist } = useEquipmentTypeManager();
  const { performEquipmentAllocation, createAuditEntries } = useEquipmentAllocator(jobId);
  const { returnAllJobEquipment, returnEquipmentToLocation } = useEquipmentReturner(jobId);

  const autoAllocateEquipment = (locationId: string, usage?: EquipmentUsage) => {
    if (!locationId) {
      toast.error('Please select a location before allocating equipment');
      return;
    }

    // Safety check - only proceed if explicitly called (manual sync)
    console.log('Manual equipment allocation requested for job:', jobId);

    const currentUsage = usage || calculateEquipmentUsage();
    
    // Ensure all equipment types exist before allocation
    ensureEquipmentTypesExist(currentUsage);

    // Return any previously allocated equipment for this job
    returnAllJobEquipment();

    const updatedItems = [...data.equipmentItems];
    const allocatedItems = performEquipmentAllocation(locationId, currentUsage, updatedItems);

    updateEquipmentItems(updatedItems);
    createAuditEntries(allocatedItems, locationId);

    toast.success(`Equipment manually allocated: ${allocatedItems.length} types deployed`);
  };

  return {
    calculateEquipmentUsage,
    autoAllocateEquipment,
    returnAllJobEquipment,
    returnEquipmentToLocation,
    ensureEquipmentTypesExist,
    isAutoSyncEnabled,
    setIsAutoSyncEnabled,
  };
};
