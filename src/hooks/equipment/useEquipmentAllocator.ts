
import { useInventoryData, EquipmentItem } from '../useInventoryData';
import { useAuditTrail } from '../useAuditTrail';
import { toast } from 'sonner';
import { EquipmentUsage } from './useEquipmentUsageCalculator';

export const useEquipmentAllocator = (jobId: string) => {
  const { data, updateEquipmentItems } = useInventoryData();
  const { addAuditEntry } = useAuditTrail();

  const cleanupDuplicateDeployments = (updatedItems: EquipmentItem[]) => {
    // Remove duplicate deployed records for the same job+equipment combination
    const seenDeployments = new Set<string>();
    const cleanedItems = updatedItems.filter(item => {
      if (item.status === 'deployed' && item.jobId === jobId) {
        const deploymentKey = `${item.typeId}-${item.jobId}`;
        if (seenDeployments.has(deploymentKey)) {
          console.log(`Removing duplicate deployment for ${deploymentKey}`);
          return false; // Remove duplicate
        }
        seenDeployments.add(deploymentKey);
      }
      return true;
    });
    
    return cleanedItems;
  };

  const getExistingDeployment = (updatedItems: EquipmentItem[], typeId: string) => {
    return updatedItems.find(
      item => item.typeId === typeId && item.jobId === jobId && item.status === 'deployed'
    );
  };

  const allocateOrUpdateEquipment = (
    updatedItems: EquipmentItem[], 
    typeId: string, 
    quantity: number, 
    locationId: string
  ): { allocated: number; updated: boolean } => {
    // Check if equipment is already deployed for this job
    const existingDeployment = getExistingDeployment(updatedItems, typeId);
    
    if (existingDeployment) {
      // Update existing deployment if quantity changed
      if (existingDeployment.quantity !== quantity) {
        const quantityDiff = quantity - existingDeployment.quantity;
        
        // Find available equipment at the location
        const availableItem = updatedItems.find(
          item => item.typeId === typeId && item.locationId === locationId && item.status === 'available'
        );
        
        if (availableItem && availableItem.quantity >= quantityDiff) {
          // Adjust available quantity
          availableItem.quantity -= quantityDiff;
          availableItem.lastUpdated = new Date();
          
          // Update deployed quantity
          existingDeployment.quantity = quantity;
          existingDeployment.lastUpdated = new Date();
          
          console.log(`Updated existing deployment for typeId ${typeId}: ${existingDeployment.quantity} -> ${quantity}`);
          return { allocated: quantity, updated: true };
        } else if (quantityDiff < 0) {
          // Reducing deployment - return excess to available
          const returnQuantity = Math.abs(quantityDiff);
          
          if (availableItem) {
            availableItem.quantity += returnQuantity;
            availableItem.lastUpdated = new Date();
          } else {
            // Create new available item
            updatedItems.push({
              id: `available-${typeId}-${locationId}`,
              typeId,
              locationId,
              quantity: returnQuantity,
              status: 'available',
              lastUpdated: new Date(),
            });
          }
          
          existingDeployment.quantity = quantity;
          existingDeployment.lastUpdated = new Date();
          
          console.log(`Reduced deployment for typeId ${typeId}: returning ${returnQuantity} to available`);
          return { allocated: quantity, updated: true };
        } else {
          // Not enough available equipment for increase
          const typeName = data.equipmentTypes.find(t => t.id === typeId)?.name || 'Unknown';
          toast.warning(`Insufficient ${typeName} to increase deployment (need ${quantityDiff} more)`);
          return { allocated: existingDeployment.quantity, updated: false };
        }
      } else {
        // No change needed
        console.log(`No change needed for typeId ${typeId}: already deployed ${quantity}`);
        return { allocated: quantity, updated: false };
      }
    }

    // No existing deployment - create new one
    const availableItem = updatedItems.find(
      item => item.typeId === typeId && item.locationId === locationId && item.status === 'available'
    );

    if (availableItem && availableItem.quantity >= quantity) {
      // Sufficient equipment available
      availableItem.quantity -= quantity;
      availableItem.lastUpdated = new Date();
      
      // Add deployed record with consistent ID
      updatedItems.push({
        id: `deployed-${typeId}-${jobId}`,
        typeId,
        locationId,
        quantity,
        status: 'deployed',
        jobId,
        lastUpdated: new Date(),
      });

      console.log(`Created new deployment for typeId ${typeId}: ${quantity} units`);
      return { allocated: quantity, updated: true };
    } else {
      // Insufficient equipment
      const typeName = data.equipmentTypes.find(t => t.id === typeId)?.name || 'Unknown';
      const available = availableItem ? availableItem.quantity : 0;
      toast.error(`Insufficient ${typeName} available (need ${quantity}, have ${available})`);
      return { allocated: 0, updated: false };
    }
  };

  const performEquipmentAllocation = (
    locationId: string,
    usage: EquipmentUsage,
    updatedItems: EquipmentItem[]
  ): Array<{ typeId: string; quantity: number; typeName: string; updated: boolean }> => {
    // Clean up any existing duplicates first
    const cleanedItems = cleanupDuplicateDeployments(updatedItems);
    updatedItems.length = 0;
    updatedItems.push(...cleanedItems);

    const allocatedItems: Array<{ typeId: string; quantity: number; typeName: string; updated: boolean }> = [];

    // Type mapping for allocation
    const typeMapping: { [key: string]: string } = {
      '100ft': '1',
      '200ft': '2',
      '300ft': '4',
    };

    // Allocate cables
    Object.entries(usage.cables).forEach(([cableType, quantity]) => {
      const typeId = typeMapping[cableType];
      if (typeId && quantity > 0) {
        const result = allocateOrUpdateEquipment(updatedItems, typeId, quantity, locationId);
        if (result.allocated > 0) {
          allocatedItems.push({
            typeId,
            quantity: result.allocated,
            typeName: data.equipmentTypes.find(t => t.id === typeId)?.name || 'Unknown',
            updated: result.updated,
          });
        }
      }
    });

    // Allocate other equipment
    const allocations = [
      { typeId: '7', quantity: usage.gauges, name: 'Pressure Gauges' },
      { typeId: '9', quantity: usage.adapters, name: 'Y Adapters' },
      { typeId: '11', quantity: usage.computers, name: 'Company Computers' },
      { typeId: '10', quantity: usage.satellite, name: 'Satellite' },
    ];

    allocations.forEach(({ typeId, quantity, name }) => {
      if (quantity > 0) {
        const result = allocateOrUpdateEquipment(updatedItems, typeId, quantity, locationId);
        if (result.allocated > 0) {
          allocatedItems.push({
            typeId,
            quantity: result.allocated,
            typeName: name,
            updated: result.updated,
          });
        }
      }
    });

    return allocatedItems;
  };

  const createAuditEntries = (allocatedItems: Array<{ typeId: string; quantity: number; typeName: string; updated: boolean }>, locationId: string) => {
    // Create audit entries only for items that were actually updated
    allocatedItems.filter(item => item.updated).forEach(item => {
      addAuditEntry({
        action: 'deploy',
        entityType: 'equipment',
        entityId: item.typeId,
        details: {
          quantity: item.quantity,
          fromLocation: locationId,
          jobId,
        },
        metadata: { source: 'manual' },
      });
    });
  };

  return {
    allocateOrUpdateEquipment,
    performEquipmentAllocation,
    createAuditEntries,
    cleanupDuplicateDeployments,
  };
};
