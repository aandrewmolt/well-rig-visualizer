
import { useInventoryData, EquipmentItem } from '../useInventoryData';
import { useAuditTrail } from '../useAuditTrail';
import { toast } from 'sonner';
import { EquipmentUsage } from './useEquipmentUsageCalculator';

export const useEquipmentAllocator = (jobId: string) => {
  const { data, updateEquipmentItems } = useInventoryData();
  const { addAuditEntry } = useAuditTrail();

  const allocateOrCreateEquipment = (
    updatedItems: EquipmentItem[], 
    typeId: string, 
    quantity: number, 
    locationId: string
  ): { allocated: number; created: number } => {
    const availableItem = updatedItems.find(
      item => item.typeId === typeId && item.locationId === locationId && item.status === 'available'
    );

    let allocated = 0;
    let created = 0;

    if (availableItem && availableItem.quantity >= quantity) {
      // Sufficient equipment available
      availableItem.quantity -= quantity;
      availableItem.lastUpdated = new Date();
      allocated = quantity;
      
      // Add deployed record
      updatedItems.push({
        id: `deployed-${typeId}-${jobId}-${Date.now()}`,
        typeId,
        locationId,
        quantity,
        status: 'deployed',
        jobId,
        lastUpdated: new Date(),
      });
    } else {
      // More conservative approach - warn instead of auto-creating
      const currentAvailable = availableItem ? availableItem.quantity : 0;
      const needed = quantity - currentAvailable;

      if (availableItem && currentAvailable > 0) {
        // Use what's available
        availableItem.quantity = 0;
        availableItem.lastUpdated = new Date();
        allocated += currentAvailable;
        
        updatedItems.push({
          id: `deployed-${typeId}-${jobId}-${Date.now()}-partial`,
          typeId,
          locationId,
          quantity: currentAvailable,
          status: 'deployed',
          jobId,
          lastUpdated: new Date(),
        });
      }

      // Only create if specifically requested, with better user feedback
      if (needed > 0) {
        const typeName = data.equipmentTypes.find(t => t.id === typeId)?.name || 'Unknown';
        
        // Ask user for confirmation before creating new equipment
        const shouldCreate = confirm(`Not enough ${typeName} available (need ${needed} more). Create additional inventory?`);
        
        if (shouldCreate) {
          const newAvailableItem = {
            id: `manual-created-${typeId}-${locationId}-${Date.now()}`,
            typeId,
            locationId,
            quantity: 0, // Will be immediately allocated
            status: 'available' as const,
            lastUpdated: new Date(),
          };
          updatedItems.push(newAvailableItem);

          // Add deployed record for the needed amount
          updatedItems.push({
            id: `deployed-${typeId}-${jobId}-${Date.now()}-created`,
            typeId,
            locationId,
            quantity: needed,
            status: 'deployed',
            jobId,
            lastUpdated: new Date(),
          });

          allocated += needed;
          created = needed;

          // Audit trail for equipment creation
          addAuditEntry({
            action: 'create',
            entityType: 'equipment',
            entityId: typeId,
            details: { 
              quantity: needed,
              reason: 'Manual creation for job allocation',
              toLocation: locationId,
            },
            metadata: { source: 'manual' },
          });
          
          toast.info(`Created ${needed} additional ${typeName} for job allocation`);
        } else {
          toast.warning(`Insufficient ${typeName} - only allocated ${allocated} of ${quantity} needed`);
        }
      }
    }

    return { allocated, created };
  };

  const performEquipmentAllocation = (
    locationId: string,
    usage: EquipmentUsage,
    updatedItems: EquipmentItem[]
  ): Array<{ typeId: string; quantity: number; typeName: string }> => {
    const allocatedItems: Array<{ typeId: string; quantity: number; typeName: string }> = [];

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
        const result = allocateOrCreateEquipment(updatedItems, typeId, quantity, locationId);
        if (result.allocated > 0) {
          allocatedItems.push({
            typeId,
            quantity: result.allocated,
            typeName: data.equipmentTypes.find(t => t.id === typeId)?.name || 'Unknown',
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
        const result = allocateOrCreateEquipment(updatedItems, typeId, quantity, locationId);
        if (result.allocated > 0) {
          allocatedItems.push({
            typeId,
            quantity: result.allocated,
            typeName: name,
          });
        }
      }
    });

    return allocatedItems;
  };

  const createAuditEntries = (allocatedItems: Array<{ typeId: string; quantity: number; typeName: string }>, locationId: string) => {
    // Create audit entries for all allocations
    allocatedItems.forEach(item => {
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
    allocateOrCreateEquipment,
    performEquipmentAllocation,
    createAuditEntries,
  };
};
