import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useInventoryData } from './useInventoryData';
import { useComprehensiveEquipmentTracking } from './equipment/useComprehensiveEquipmentTracking';
import { toast } from 'sonner';
import { EquipmentItem } from '@/types/inventory';

export const useRobustEquipmentTracking = (jobId: string, nodes: Node[], edges: Edge[]) => {
  const { data, updateEquipmentItems } = useInventoryData();
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
    const deployedItem: EquipmentItem = {
      id: `deployed-${typeId}-${jobId}-${Date.now()}`,
      typeId,
      locationId,
      quantity,
      status: 'deployed',
      jobId,
      lastUpdated: new Date(),
      notes: `Allocated for job diagram analysis`,
    };

    updatedItems.push(deployedItem);
    return true;
  };

  const returnAllJobEquipment = useCallback(() => {
    console.log(`Returning all equipment for job ${jobId}`);
    
    const updatedItems: EquipmentItem[] = [];
    
    data.equipmentItems.forEach(item => {
      if (item.status === 'deployed' && item.jobId === jobId) {
        // Find corresponding available item to return quantity to
        const availableItem = data.equipmentItems.find(
          available => 
            available.typeId === item.typeId && 
            available.locationId === item.locationId &&
            available.status === 'available' &&
            available.id !== item.id
        );

        if (availableItem) {
          // Update the available item quantity
          const updatedAvailableItem = updatedItems.find(ui => ui.id === availableItem.id) || availableItem;
          updatedAvailableItem.quantity += item.quantity;
          updatedAvailableItem.lastUpdated = new Date();
          
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
      item => item.status === 'deployed' && item.jobId === jobId
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
        .filter(item => item.typeId === typeId)
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
