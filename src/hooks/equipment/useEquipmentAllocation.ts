
import { useInventoryData } from '@/hooks/useInventoryData';
import { useComprehensiveEquipmentTracking } from './useComprehensiveEquipmentTracking';
import { useInventoryMapperSync } from '@/hooks/useInventoryMapperSync';
import { toast } from 'sonner';

export const useEquipmentAllocation = (jobId: string) => {
  const { data, updateEquipmentItems } = useInventoryData();
  const { analyzeEquipmentUsage, validateEquipmentAvailability, generateEquipmentReport } = useComprehensiveEquipmentTracking([], []);
  const { 
    validateEquipmentAvailability: validateEquipmentSync, 
    allocateEquipment: allocateEquipmentSync 
  } = useInventoryMapperSync();

  const allocateEquipmentType = async (
    updatedItems: any[], 
    typeId: string, 
    quantity: number, 
    locationId: string, 
    jobId: string,
    jobName: string = 'Current Job'
  ): Promise<boolean> => {
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

    // Validate using sync hook before allocation
    const isValid = await validateEquipmentSync(availableItem.id, jobId);
    if (!isValid) {
      return false;
    }

    // Deduct from available
    availableItem.quantity -= quantity;
    availableItem.lastUpdated = new Date();

    // Create deployed record
    const deployedId = `deployed-${typeId}-${jobId}-${Date.now()}`;
    updatedItems.push({
      id: deployedId,
      typeId,
      locationId,
      quantity,
      status: 'deployed',
      jobId,
      lastUpdated: new Date(),
      notes: `Manually allocated from diagram analysis`,
    });

    // Allocate using sync hook
    try {
      await allocateEquipmentSync(deployedId, jobId, jobName);
    } catch (error) {
      console.error('Failed to sync equipment allocation:', error);
    }

    return true;
  };

  const performComprehensiveAllocation = async (locationId: string, nodes: any[], edges: any[], jobName: string = 'Current Job') => {
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
    for (const [typeId, details] of Object.entries(usage.cables)) {
      if (details.quantity > 0) {
        const success = await allocateEquipmentType(updatedItems, typeId, details.quantity, locationId, jobId, jobName);
        if (success) {
          allocatedItems.push(`${details.quantity}x ${details.typeName}`);
        }
      }
    }

    // Allocate other equipment
    const equipmentAllocations = [
      { typeId: '7', quantity: usage.gauges, name: 'Pressure Gauges' },
      { typeId: '9', quantity: usage.adapters, name: 'Y Adapters' },
      { typeId: '11', quantity: usage.computers, name: 'Company Computers' },
      { typeId: '10', quantity: usage.satellite, name: 'Satellite Equipment' },
    ];

    for (const { typeId, quantity, name } of equipmentAllocations) {
      if (quantity > 0) {
        const success = await allocateEquipmentType(updatedItems, typeId, quantity, locationId, jobId, jobName);
        if (success) {
          allocatedItems.push(`${quantity}x ${name}`);
        }
      }
    }

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
