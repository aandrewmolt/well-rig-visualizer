
import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useInventory } from '@/contexts/InventoryContext';
import { useComprehensiveEquipmentTracking } from './equipment/useComprehensiveEquipmentTracking';
import { toast } from 'sonner';
import { IndividualEquipment } from '@/types/inventory';

export const useRobustEquipmentTracking = (jobId: string, nodes: Node[], edges: Edge[]) => {
  const { data, updateIndividualEquipment } = useInventory();
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

      const allocatedItems: string[] = [];

      // Allocate individual equipment items based on analysis
      Object.entries(usage.cables).forEach(([typeId, details]) => {
        if (details.quantity > 0) {
          // Find available equipment of this type
          const availableEquipment = data.individualEquipment.filter(
            eq => eq.typeId === typeId && eq.locationId === locationId && eq.status === 'available'
          );

          if (availableEquipment.length >= details.quantity) {
            // Deploy the required quantity
            for (let i = 0; i < details.quantity; i++) {
              updateIndividualEquipment(availableEquipment[i].id, {
                status: 'deployed',
                jobId: jobId
              });
            }
            allocatedItems.push(`${details.quantity}x ${details.typeName}`);
          } else {
            toast.error(`Insufficient ${details.typeName} at selected location`);
          }
        }
      });

      // Allocate other equipment types
      const equipmentAllocations = [
        { typeId: '7', quantity: usage.gauges, name: 'Pressure Gauges' },
        { typeId: '9', quantity: usage.adapters, name: 'Y Adapters' },
        { typeId: '11', quantity: usage.computers, name: 'Company Computers' },
        { typeId: '10', quantity: usage.satellite, name: 'Satellite Equipment' },
      ];

      equipmentAllocations.forEach(({ typeId, quantity, name }) => {
        if (quantity > 0) {
          const availableEquipment = data.individualEquipment.filter(
            eq => eq.typeId === typeId && eq.locationId === locationId && eq.status === 'available'
          );

          if (availableEquipment.length >= quantity) {
            for (let i = 0; i < quantity; i++) {
              updateIndividualEquipment(availableEquipment[i].id, {
                status: 'deployed',
                jobId: jobId
              });
            }
            allocatedItems.push(`${quantity}x ${name}`);
          } else {
            toast.error(`Insufficient ${name} at selected location`);
          }
        }
      });

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
  }, [jobId, nodes, edges, data.individualEquipment, updateIndividualEquipment]);

  const returnAllJobEquipment = useCallback(() => {
    console.log(`Returning all equipment for job ${jobId}`);
    
    const deployedEquipment = data.individualEquipment.filter(
      item => item.status === 'deployed' && item.jobId === jobId
    );

    deployedEquipment.forEach(item => {
      updateIndividualEquipment(item.id, {
        status: 'available',
        jobId: null
      });
    });

    toast.success('All equipment returned to storage');
  }, [jobId, data.individualEquipment, updateIndividualEquipment]);

  const validateInventoryConsistency = useCallback(() => {
    const deployedItems = data.individualEquipment.filter(
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
        .length;
      
      if (deployed !== required) {
        isConsistent = false;
      }
    });

    return isConsistent;
  }, [jobId, data.individualEquipment, analyzeEquipmentUsage]);

  return {
    performComprehensiveAllocation,
    returnAllJobEquipment,
    validateInventoryConsistency,
    analyzeEquipmentUsage,
    generateEquipmentReport,
    isProcessing
  };
};
