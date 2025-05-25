
import { useState, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useComprehensiveEquipmentTracking } from './equipment/useComprehensiveEquipmentTracking';
import { toast } from 'sonner';

export const useRobustEquipmentTracking = (jobId: string, nodes: Node[], edges: Edge[]) => {
  const { data, updateEquipmentItems } = useInventoryData();
  const { analyzeEquipmentUsage, validateEquipmentAvailability, generateEquipmentReport } = useComprehensiveEquipmentTracking(nodes, edges);
  const [lastSyncHash, setLastSyncHash] = useState<string>('');
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);

  const performComprehensiveAllocation = (locationId: string) => {
    if (!locationId) {
      toast.error('Please select a location before allocating equipment');
      return;
    }

    console.log(`Starting comprehensive equipment allocation for job ${jobId}`);
    
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

    // First, return any previously allocated equipment for this job
    returnAllJobEquipment();

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

    // Create sync hash to prevent duplicate allocations
    const syncHash = JSON.stringify({ nodes: nodes.length, edges: edges.length, locationId, jobId });
    setLastSyncHash(syncHash);

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
      notes: `Auto-allocated from diagram analysis`,
    });

    return true;
  };

  const returnAllJobEquipment = () => {
    console.log(`Returning all equipment for job ${jobId}`);
    
    const deployedItems = data.equipmentItems.filter(
      item => item.status === 'deployed' && item.jobId === jobId
    );

    if (deployedItems.length === 0) {
      console.log('No deployed equipment found for this job');
      return;
    }

    const updatedItems = data.equipmentItems.map(item => {
      if (item.status === 'deployed' && item.jobId === jobId) {
        // Find corresponding available item to return quantity to
        const availableItem = data.equipmentItems.find(
          availItem => 
            availItem.typeId === item.typeId && 
            availItem.locationId === item.locationId && 
            availItem.status === 'available'
        );
        
        if (availableItem) {
          availableItem.quantity += item.quantity;
          availableItem.lastUpdated = new Date();
        } else {
          // Create new available item if none exists
          return {
            id: `returned-${item.typeId}-${item.locationId}-${Date.now()}`,
            typeId: item.typeId,
            locationId: item.locationId,
            quantity: item.quantity,
            status: 'available' as const,
            lastUpdated: new Date(),
          };
        }
        return null; // Mark deployed item for removal
      }
      return item;
    }).filter(Boolean);

    updateEquipmentItems(updatedItems as any[]);
    
    const returnedCount = deployedItems.length;
    const returnedItems = deployedItems.map(item => {
      const type = data.equipmentTypes.find(t => t.id === item.typeId);
      return `${item.quantity}x ${type?.name || 'Unknown'}`;
    }).join(', ');

    toast.success(`Returned ${returnedCount} equipment types: ${returnedItems}`);
    console.log('Equipment return completed:', { jobId, returnedCount, deployedItems });
  };

  const validateInventoryConsistency = () => {
    const usage = analyzeEquipmentUsage();
    const deployedItems = data.equipmentItems.filter(
      item => item.status === 'deployed' && item.jobId === jobId
    );

    const inconsistencies: string[] = [];

    // Check if deployed quantities match diagram requirements
    Object.entries(usage.cables).forEach(([typeId, details]) => {
      const deployed = deployedItems
        .filter(item => item.typeId === typeId)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (deployed !== details.quantity) {
        const equipmentType = data.equipmentTypes.find(type => type.id === typeId);
        inconsistencies.push(
          `${equipmentType?.name}: Diagram requires ${details.quantity}, but ${deployed} deployed`
        );
      }
    });

    if (inconsistencies.length > 0) {
      console.warn('Inventory inconsistencies detected:', inconsistencies);
      toast.warning(`Inventory inconsistencies: ${inconsistencies.join(', ')}`);
      return false;
    }

    return true;
  };

  // Auto-sync when diagram changes
  useEffect(() => {
    if (!isAutoSyncEnabled) return;

    const currentHash = JSON.stringify({ 
      nodes: nodes.map(n => ({ id: n.id, type: n.type })), 
      edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target, type: e.type, data: e.data }))
    });

    if (currentHash !== lastSyncHash && nodes.length > 0) {
      console.log('Diagram changed, validating inventory consistency...');
      validateInventoryConsistency();
    }
  }, [nodes, edges, isAutoSyncEnabled, lastSyncHash]);

  return {
    performComprehensiveAllocation,
    returnAllJobEquipment,
    validateInventoryConsistency,
    analyzeEquipmentUsage,
    generateEquipmentReport,
    isAutoSyncEnabled,
    setIsAutoSyncEnabled,
  };
};
