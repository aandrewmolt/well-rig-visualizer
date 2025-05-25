
import { useInventoryData } from '@/hooks/useInventoryData';
import { useComprehensiveEquipmentTracking } from './useComprehensiveEquipmentTracking';
import { toast } from 'sonner';

export const useEquipmentAllocation = (jobId: string) => {
  const { data, updateEquipmentItems } = useInventoryData();
  const { analyzeEquipmentUsage, validateEquipmentAvailability, generateEquipmentReport } = useComprehensiveEquipmentTracking([], []);

  const allocateEquipmentType = (
    updatedItems: any[], 
    typeId: string, 
    quantity: number, 
    locationId: string, 
    jobId: string
  ): boolean => {
    // Find available equipment at location
    const availableItem = updatedItems.find(
      item => 
        item.typeId === typeId && 
        item.locationId === locationId && 
        item.status === 'available'
    );
    
    if (!availableItem || availableItem.quantity < quantity) {
      const equipmentType = data.equipmentTypes.find(type => type.id === typeId);
      toast.error(`Insufficient ${equipmentType?.name || 'equipment'} at selected location`);
      return false;
    }

    // Deduct from available
    availableItem.quantity -= quantity;
    availableItem.lastUpdated = new Date();

    // Create deployed record
    updatedItems.push({
      id: `deployed-${typeId}-${jobId}-${Date.now()}`,
      typeId,
      locationId,
      quantity,
      status: 'deployed',
      jobId,
      lastUpdated: new Date(),
      notes: `Manually allocated from diagram analysis`,
    });

    return true;
  };

  const performComprehensiveAllocation = (locationId: string, nodes: any[], edges: any[]) => {
    if (!locationId) {
      toast.error('Please select a location before allocating equipment');
      return;
    }

    console.log(`Starting comprehensive equipment allocation for job ${jobId}`);
    
    const { analyzeEquipmentUsage, validateEquipmentAvailability, generateEquipmentReport } = useComprehensiveEquipmentTracking(nodes, edges);
    const usage = analyzeEquipmentUsage();
    const report = generateEquipmentReport(usage);
    const validation = validateEquipmentAvailability(usage, locationId);

    // Show validation issues if any
    if (validation.issues.length > 0) {
      toast.error(`Cannot allocate equipment: ${validation.issues.join(', ')}`);
      return;
    }

    if (validation.warnings.length > 0) {
      toast.warning(`Equipment allocation warnings: ${validation.warnings.join(', ')}`);
    }

    const updatedItems = [...data.equipmentItems];
    const allocatedItems: string[] = [];

    // Allocate cables with precise tracking
    Object.entries(usage.cables).forEach(([typeId, details]) => {
      if (details.quantity > 0) {
        const success = allocateEquipmentType(updatedItems, typeId, details.quantity, locationId, jobId);
        if (success) {
          allocatedItems.push(`${details.quantity}x ${details.typeName}`);
        }
      }
    });

    // Allocate other equipment
    const equipmentAllocations = [
      { typeId: '7', quantity: usage.gauges, name: 'Pressure Gauges' },
      { typeId: '9', quantity: usage.adapters, name: 'Y Adapters' },
      { typeId: '11', quantity: usage.computers, name: 'Company Computers' },
      { typeId: '10', quantity: usage.satellite, name: 'Satellite Equipment' },
    ];

    equipmentAllocations.forEach(({ typeId, quantity, name }) => {
      if (quantity > 0) {
        const success = allocateEquipmentType(updatedItems, typeId, quantity, locationId, jobId);
        if (success) {
          allocatedItems.push(`${quantity}x ${name}`);
        }
      }
    });

    // Update inventory
    updateEquipmentItems(updatedItems);

    // Provide detailed feedback
    if (allocatedItems.length > 0) {
      toast.success(`Equipment allocated: ${allocatedItems.join(', ')}`);
      console.log('Equipment allocation successful:', {
        jobId,
        locationId,
        allocatedItems,
        report,
      });
    } else {
      toast.info('No equipment changes needed - allocation up to date');
    }
  };

  return {
    performComprehensiveAllocation,
    allocateEquipmentType,
  };
};
