
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
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);

  // Use the smaller, focused hooks
  const { calculateEquipmentUsage } = useEquipmentUsageCalculator(nodes, edges);
  const { ensureEquipmentTypesExist } = useEquipmentTypeManager();
  const { performEquipmentAllocation, createAuditEntries, cleanupDuplicateDeployments } = useEquipmentAllocator(jobId);
  const { returnAllJobEquipment, returnEquipmentToLocation } = useEquipmentReturner(jobId);

  const autoAllocateEquipment = (locationId: string, usage?: EquipmentUsage) => {
    if (!locationId) {
      toast.error('Please select a location before allocating equipment');
      return;
    }

    console.log('Equipment allocation/update requested for job:', jobId);

    const currentUsage = usage || calculateEquipmentUsage();
    
    // Ensure all equipment types exist before allocation
    ensureEquipmentTypesExist(currentUsage);

    // Clean up any duplicate deployments first
    let updatedItems = [...data.equipmentItems];
    updatedItems = cleanupDuplicateDeployments(updatedItems);

    // Check if we have any existing deployments for this job
    const existingDeployments = updatedItems.filter(
      item => item.status === 'deployed' && item.jobId === jobId
    );

    const hasExistingDeployments = existingDeployments.length > 0;

    // Perform allocation/update
    const allocatedItems = performEquipmentAllocation(locationId, currentUsage, updatedItems);

    updateEquipmentItems(updatedItems);
    
    // Create audit entries for changes
    createAuditEntries(allocatedItems, locationId);

    // Provide better user feedback
    const updatedCount = allocatedItems.filter(item => item.updated).length;
    const totalTypes = allocatedItems.length;

    if (hasExistingDeployments && updatedCount > 0) {
      toast.success(`Equipment allocation updated: ${updatedCount} of ${totalTypes} types modified`);
    } else if (hasExistingDeployments && updatedCount === 0) {
      toast.info('Equipment allocation unchanged - already up to date');
    } else {
      toast.success(`Equipment allocated: ${totalTypes} types deployed`);
    }
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
