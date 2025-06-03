
import { Node, Edge } from '@xyflow/react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { toast } from 'sonner';

interface DetailedEquipmentUsage {
  cables: {
    [typeId: string]: {
      typeName: string;
      quantity: number;
      category: string;
    };
  };
  gauges: number;
  adapters: number;
  computers: number;
  satellite: number;
  directConnections: number;
  totalConnections: number;
}

export const useSupabaseEquipmentTracking = (jobId: string, nodes: Node[], edges: Edge[]) => {
  const { data, updateSingleEquipmentItem, addEquipmentItem } = useSupabaseInventory();

  const analyzeEquipmentUsage = (): DetailedEquipmentUsage => {
    const usage: DetailedEquipmentUsage = {
      cables: {},
      gauges: 0,
      adapters: 0,
      computers: 0,
      satellite: 0,
      directConnections: 0,
      totalConnections: 0,
    };

    // Analyze each edge for cable usage
    edges.forEach(edge => {
      usage.totalConnections++;

      const edgeData = edge.data;

      if (edgeData?.connectionType === 'direct') {
        usage.directConnections++;
      } else if (edgeData?.connectionType === 'cable' && edgeData.cableTypeId) {
        const cableTypeId = edgeData.cableTypeId;
        const equipmentType = data.equipmentTypes.find(type => type.id === cableTypeId);
        
        if (equipmentType) {
          if (!usage.cables[cableTypeId]) {
            usage.cables[cableTypeId] = {
              typeName: equipmentType.name,
              quantity: 0,
              category: equipmentType.category,
            };
          }
          usage.cables[cableTypeId].quantity++;
        }
      }
    });

    // Analyze nodes for equipment usage
    nodes.forEach(node => {
      switch (node.type) {
        case 'well':
        case 'wellsideGauge':
          usage.gauges++;
          break;
        case 'yAdapter':
          usage.adapters++;
          break;
        case 'companyComputer':
          usage.computers++;
          break;
        case 'satellite':
          usage.satellite++;
          break;
      }
    });

    return usage;
  };

  const performComprehensiveAllocation = async (locationId: string) => {
    if (!locationId) {
      toast.error('Please select a location before allocating equipment');
      return;
    }

    console.log(`Starting comprehensive equipment allocation for job ${jobId}`);
    
    const usage = analyzeEquipmentUsage();
    console.log('Equipment usage:', usage);

    // Find or create equipment type mappings
    const getEquipmentTypeId = (category: string, name: string) => {
      return data.equipmentTypes.find(type => 
        type.category === category && type.name.toLowerCase().includes(name.toLowerCase())
      )?.id;
    };

    const allocatedItems: string[] = [];

    // Allocate cables
    for (const [typeId, details] of Object.entries(usage.cables)) {
      if (details.quantity > 0) {
        const success = await allocateEquipmentType(typeId, details.quantity, locationId);
        if (success) {
          allocatedItems.push(`${details.quantity}x ${details.typeName}`);
        }
      }
    }

    // Allocate other equipment
    const allocations = [
      { category: 'gauges', name: 'pressure', quantity: usage.gauges },
      { category: 'adapters', name: 'y adapter', quantity: usage.adapters },
      { category: 'communication', name: 'computer', quantity: usage.computers },
      { category: 'communication', name: 'satellite', quantity: usage.satellite },
    ];

    for (const { category, name, quantity } of allocations) {
      if (quantity > 0) {
        const typeId = getEquipmentTypeId(category, name);
        if (typeId) {
          const success = await allocateEquipmentType(typeId, quantity, locationId);
          if (success) {
            allocatedItems.push(`${quantity}x ${name}`);
          }
        }
      }
    }

    if (allocatedItems.length > 0) {
      toast.success(`Equipment allocated: ${allocatedItems.join(', ')}`);
    } else {
      toast.info('No equipment changes needed');
    }
  };

  const allocateEquipmentType = async (typeId: string, quantity: number, locationId: string): Promise<boolean> => {
    try {
      // Check if already deployed
      const existingDeployment = data.equipmentItems.find(
        item => item.typeId === typeId && item.jobId === jobId && item.status === 'deployed'
      );

      if (existingDeployment) {
        if (existingDeployment.quantity === quantity) {
          return false; // No change needed
        }
        
        // Update existing deployment
        await updateSingleEquipmentItem(existingDeployment.id, {
          quantity,
          lastUpdated: new Date(),
        });
        return true;
      }

      // Find available equipment
      const availableItem = data.equipmentItems.find(
        item => 
          item.typeId === typeId && 
          item.locationId === locationId && 
          item.status === 'available' &&
          item.quantity >= quantity
      );

      if (!availableItem) {
        const equipmentType = data.equipmentTypes.find(type => type.id === typeId);
        toast.error(`Insufficient ${equipmentType?.name || 'equipment'} at selected location`);
        return false;
      }

      // Deduct from available
      await updateSingleEquipmentItem(availableItem.id, {
        quantity: availableItem.quantity - quantity,
        lastUpdated: new Date(),
      });

      // Create deployed record
      await addEquipmentItem({
        typeId,
        locationId,
        quantity,
        status: 'deployed',
        jobId,
        notes: `Allocated from job diagram`,
      });

      return true;
    } catch (error) {
      console.error('Failed to allocate equipment:', error);
      toast.error('Failed to allocate equipment');
      return false;
    }
  };

  const returnAllJobEquipment = async () => {
    try {
      const deployedItems = data.equipmentItems.filter(
        item => item.status === 'deployed' && item.jobId === jobId
      );

      for (const deployedItem of deployedItems) {
        // Find or create available item to return to
        const availableItem = data.equipmentItems.find(
          item => 
            item.typeId === deployedItem.typeId && 
            item.locationId === deployedItem.locationId && 
            item.status === 'available'
        );

        if (availableItem) {
          // Add to existing available
          await updateSingleEquipmentItem(availableItem.id, {
            quantity: availableItem.quantity + deployedItem.quantity,
            lastUpdated: new Date(),
          });
        } else {
          // Create new available record
          await addEquipmentItem({
            typeId: deployedItem.typeId,
            locationId: deployedItem.locationId,
            quantity: deployedItem.quantity,
            status: 'available',
          });
        }

        // Remove deployed record by updating it to have 0 quantity
        await updateSingleEquipmentItem(deployedItem.id, {
          quantity: 0,
          status: 'available',
          jobId: undefined,
          lastUpdated: new Date(),
        });
      }

      toast.success('All equipment returned successfully');
    } catch (error) {
      console.error('Failed to return equipment:', error);
      toast.error('Failed to return equipment');
    }
  };

  const validateInventoryConsistency = () => {
    const usage = analyzeEquipmentUsage();
    const deployedItems = data.equipmentItems.filter(
      item => item.status === 'deployed' && item.jobId === jobId
    );

    const inconsistencies: string[] = [];

    // Check cables
    Object.entries(usage.cables).forEach(([typeId, details]) => {
      const deployed = deployedItems
        .filter(item => item.typeId === typeId)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (deployed !== details.quantity) {
        inconsistencies.push(
          `${details.typeName}: Diagram requires ${details.quantity}, but ${deployed} deployed`
        );
      }
    });

    if (inconsistencies.length > 0) {
      toast.warning(`Inventory inconsistencies: ${inconsistencies.join(', ')}`);
      return false;
    }

    return true;
  };

  return {
    analyzeEquipmentUsage,
    performComprehensiveAllocation,
    returnAllJobEquipment,
    validateInventoryConsistency,
  };
};
