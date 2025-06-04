
import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useInventory } from '@/contexts/InventoryContext';
import { useComprehensiveEquipmentTracking } from './equipment/useComprehensiveEquipmentTracking';
import { toast } from 'sonner';
import { EquipmentItem } from '@/types/inventory';

export const useRobustEquipmentTracking = (jobId: string, nodes: Node[], edges: Edge[]) => {
  const { data, updateEquipmentItems } = useInventory();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { analyzeEquipmentUsage, validateEquipmentAvailability, generateEquipmentReport } = useComprehensiveEquipmentTracking(nodes, edges);

  const performComprehensiveAllocation = useCallback((locationId: string) => {
    if (!locationId) {
      toast.error('Please select a location before allocating equipment');
      return;
    }

    setIsProcessing(true);
    console.log(`Starting comprehensive equipment allocation for job ${jobId}`);
    
    try {
      const usage = analyzeEquipmentUsage();
      const validation = validateEquipmentAvailability(usage, locationId);
      
      // Show validation issues if any
      if (validation.issues.length > 0) {
        toast.error(`Cannot allocate equipment: ${validation.issues.join(', ')}`);
        setIsProcessing(false);
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
        });
      } else {
        toast.info('No equipment changes needed - allocation up to date');
      }
    } catch (error) {
      console.error('Error during equipment allocation:', error);
      toast.error('Failed to allocate equipment');
    } finally {
      setIsProcessing(false);
    }
  }, [jobId, nodes, edges, data.equipmentItems, updateEquipmentItems]);

  const allocateEquipmentType = (
    updatedItems: EquipmentItem[], 
    typeId: string, 
    quantity: number, 
    locationId: string, 
    jobId: string
  ): boolean => {
    // Find available equipment at location
    const availableItem = updatedItems.find(
      item => 
        item.type_id === typeId && 
        item.location_id === locationId && 
        item.status === 'available'
    );
    
    if (!availableItem || availableItem.quantity < quantity) {
      const equipmentType = data.equipmentTypes.find(type => type.id === typeId);
      toast.error(`Insufficient ${equipmentType?.name || 'equipment'} at selected location`);
      return false;
    }

    // Deduct from available
    availableItem.quantity -= quantity;
    availableItem.updated_at = new Date().toISOString();

    // Create deployed record
    const deployedItem: EquipmentItem = {
      id: `deployed-${typeId}-${jobId}-${Date.now()}`,
      type_id: typeId,
      location_id: locationId,
      quantity,
      status: 'deployed',
      job_id: jobId,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      notes: `Allocated for job diagram analysis`,
      location_type: 'storage'
    };

    updatedItems.push(deployedItem);
    return true;
  };

  const returnAllJobEquipment = useCallback(() => {
    console.log(`Returning all equipment for job ${jobId}`);
    
    const updatedItems: EquipmentItem[] = [];
    
    data.equipmentItems.forEach(item => {
      if (item.status === 'deployed' && item.job_id === jobId) {
        // Find corresponding available item to return quantity to
        const availableItem = data.equipmentItems.find(
          available => 
            available.type_id === item.type_id && 
            available.location_id === item.location_id &&
            available.status === 'available' &&
            available.id !== item.id
        );

        if (availableItem) {
          // Update the available item quantity
          const updatedAvailableItem = updatedItems.find(ui => ui.id === availableItem.id) || availableItem;
          updatedAvailableItem.quantity += item.quantity;
          updatedAvailableItem.updated_at = new Date().toISOString();
          
          if (!updatedItems.find(ui => ui.id === availableItem.id)) {
            updatedItems.push(updatedAvailableItem);
          }
        }
        // Don't add the deployed item back (effectively removing it)
      } else {
        // Keep all other items
        updatedItems.push(item);
      }
    });

    updateEquipmentItems(updatedItems);
    toast.success('All equipment returned to storage');
  }, [jobId, data.equipmentItems, updateEquipmentItems]);

  const validateInventoryConsistency = useCallback(() => {
    const deployedItems = data.equipmentItems.filter(
      item => item.status === 'deployed' && item.job_id === jobId
    );

    const usage = analyzeEquipmentUsage();
    const requiredQuantities: { [typeId: string]: number } = {};

    // Calculate required quantities
    Object.entries(usage.cables).forEach(([typeId, details]) => {
      requiredQuantities[typeId] = details.quantity;
    });

    // Add other equipment requirements
    if (usage.gauges > 0) requiredQuantities['7'] = usage.gauges;
    if (usage.adapters > 0) requiredQuantities['9'] = usage.adapters;
    if (usage.computers > 0) requiredQuantities['11'] = usage.computers;
    if (usage.satellite > 0) requiredQuantities['10'] = usage.satellite;

    // Check consistency
    let isConsistent = true;
    Object.entries(requiredQuantities).forEach(([typeId, required]) => {
      const deployed = deployedItems
        .filter(item => item.type_id === typeId)
        .reduce((sum, item) => sum + item.quantity, 0);
      
      if (deployed !== required) {
        isConsistent = false;
      }
    });

    return isConsistent;
  }, [jobId, data.equipmentItems, analyzeEquipmentUsage]);

  return {
    performComprehensiveAllocation,
    returnAllJobEquipment,
    validateInventoryConsistency,
    analyzeEquipmentUsage,
    generateEquipmentReport,
    isProcessing
  };
};
