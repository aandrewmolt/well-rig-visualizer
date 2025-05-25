
import { useState, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useInventoryData, EquipmentType, EquipmentItem } from './useInventoryData';
import { useAuditTrail } from './useAuditTrail';
import { toast } from 'sonner';

interface EdgeData {
  cableType?: '100ft' | '200ft' | '300ft';
  label?: string;
}

interface EquipmentUsage {
  cables: { [key: string]: number };
  gauges: number;
  adapters: number;
  computers: number;
  satellite: number;
}

export const useEnhancedEquipmentTracking = (jobId: string, nodes: Node[], edges: Edge[]) => {
  const { data, updateEquipmentItems, updateEquipmentTypes } = useInventoryData();
  const { addAuditEntry } = useAuditTrail();
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);

  const calculateEquipmentUsage = (): EquipmentUsage => {
    const usage: EquipmentUsage = {
      cables: {},
      gauges: 0,
      adapters: 0,
      computers: 0,
      satellite: 0,
    };

    // Count cables from edges with proper type checking
    edges.forEach(edge => {
      const edgeData = edge.data as EdgeData;
      const cableType = edgeData?.cableType || '200ft';
      usage.cables[cableType] = (usage.cables[cableType] || 0) + 1;
    });

    // Count equipment from nodes
    nodes.forEach(node => {
      switch (node.type) {
        case 'well':
          usage.gauges += 1;
          break;
        case 'wellsideGauge':
          usage.gauges += 1;
          break;
        case 'yAdapter':
          usage.adapters += 1;
          break;
        case 'companyComputer':
          usage.computers += 1;
          break;
        case 'satellite':
          usage.satellite += 1;
          break;
      }
    });

    return usage;
  };

  const ensureEquipmentTypesExist = (usage: EquipmentUsage) => {
    const typeMapping: { [key: string]: { id: string; name: string; category: string } } = {
      '100ft': { id: '1', name: '100ft Cable', category: 'cables' },
      '200ft': { id: '2', name: '200ft Cable', category: 'cables' },
      '300ft': { id: '4', name: '300ft Cable (New Version)', category: 'cables' },
      'gauge': { id: '7', name: '1502 Pressure Gauge', category: 'gauges' },
      'adapter': { id: '9', name: 'Y Adapter Cable', category: 'adapters' },
      'computer': { id: '11', name: 'Customer Computer', category: 'communication' },
      'satellite': { id: '10', name: 'Starlink', category: 'communication' },
    };

    const missingTypes: EquipmentType[] = [];
    
    // Check cables
    Object.keys(usage.cables).forEach(cableType => {
      const typeInfo = typeMapping[cableType];
      if (typeInfo && !data.equipmentTypes.find(t => t.id === typeInfo.id)) {
        missingTypes.push({
          id: typeInfo.id,
          name: typeInfo.name,
          category: typeInfo.category as any,
        });
      }
    });

    // Check other equipment types
    const equipmentChecks = [
      { usage: usage.gauges, key: 'gauge' },
      { usage: usage.adapters, key: 'adapter' },
      { usage: usage.computers, key: 'computer' },
      { usage: usage.satellite, key: 'satellite' },
    ];

    equipmentChecks.forEach(({ usage: count, key }) => {
      if (count > 0) {
        const typeInfo = typeMapping[key];
        if (typeInfo && !data.equipmentTypes.find(t => t.id === typeInfo.id)) {
          missingTypes.push({
            id: typeInfo.id,
            name: typeInfo.name,
            category: typeInfo.category as any,
          });
        }
      }
    });

    if (missingTypes.length > 0) {
      const updatedTypes = [...data.equipmentTypes, ...missingTypes];
      updateEquipmentTypes(updatedTypes);
      
      // Audit trail for equipment type creation
      missingTypes.forEach(type => {
        addAuditEntry({
          action: 'create',
          entityType: 'type',
          entityId: type.id,
          details: { after: type },
          metadata: { source: 'auto-sync' },
        });
      });
      
      toast.info(`Created ${missingTypes.length} missing equipment types`);
    }
  };

  const autoAllocateEquipment = (locationId: string, usage?: EquipmentUsage) => {
    if (!locationId || !isAutoSyncEnabled) return;

    const currentUsage = usage || calculateEquipmentUsage();
    
    // Ensure all equipment types exist before allocation
    ensureEquipmentTypesExist(currentUsage);

    // Return any previously allocated equipment for this job
    returnAllJobEquipment();

    const updatedItems = [...data.equipmentItems];
    const allocatedItems: Array<{ typeId: string; quantity: number; typeName: string }> = [];

    // Type mapping for allocation
    const typeMapping: { [key: string]: string } = {
      '100ft': '1',
      '200ft': '2',
      '300ft': '4',
    };

    // Allocate cables
    Object.entries(currentUsage.cables).forEach(([cableType, quantity]) => {
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
      { typeId: '7', quantity: currentUsage.gauges, name: 'Pressure Gauges' },
      { typeId: '9', quantity: currentUsage.adapters, name: 'Y Adapters' },
      { typeId: '11', quantity: currentUsage.computers, name: 'Company Computers' },
      { typeId: '10', quantity: currentUsage.satellite, name: 'Satellite' },
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

    updateEquipmentItems(updatedItems);

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
        metadata: { source: 'auto-sync' },
      });
    });

    toast.success(`Equipment automatically allocated: ${allocatedItems.length} types deployed`);
  };

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
      // Insufficient equipment - create or supplement
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

      // Create additional inventory for what's needed
      if (needed > 0) {
        const newAvailableItem = {
          id: `auto-created-${typeId}-${locationId}-${Date.now()}`,
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

        const typeName = data.equipmentTypes.find(t => t.id === typeId)?.name || 'Unknown';
        
        // Audit trail for equipment creation
        addAuditEntry({
          action: 'create',
          entityType: 'equipment',
          entityId: typeId,
          details: { 
            quantity: needed,
            reason: 'Auto-created for job allocation',
            toLocation: locationId,
          },
          metadata: { source: 'auto-sync' },
        });
        
        toast.info(`Created ${needed} additional ${typeName} for job allocation`);
      }
    }

    return { allocated, created };
  };

  const returnAllJobEquipment = () => {
    const deployedItems = data.equipmentItems.filter(
      item => item.status === 'deployed' && item.jobId === jobId
    );

    if (deployedItems.length === 0) return;

    const updatedItems = data.equipmentItems.filter(item => 
      !(item.status === 'deployed' && item.jobId === jobId)
    );

    // Return quantities to available items
    deployedItems.forEach(deployedItem => {
      const availableItem = updatedItems.find(
        item => 
          item.typeId === deployedItem.typeId && 
          item.locationId === deployedItem.locationId && 
          item.status === 'available'
      );

      if (availableItem) {
        availableItem.quantity += deployedItem.quantity;
        availableItem.lastUpdated = new Date();
      } else {
        // Create new available item
        updatedItems.push({
          id: `returned-${deployedItem.typeId}-${deployedItem.locationId}-${Date.now()}`,
          typeId: deployedItem.typeId,
          locationId: deployedItem.locationId,
          quantity: deployedItem.quantity,
          status: 'available',
          lastUpdated: new Date(),
        });
      }

      // Create audit entry for equipment return
      addAuditEntry({
        action: 'return',
        entityType: 'equipment',
        entityId: deployedItem.typeId,
        details: {
          quantity: deployedItem.quantity,
          toLocation: deployedItem.locationId,
          jobId,
        },
        metadata: { source: 'auto-sync' },
      });
    });

    updateEquipmentItems(updatedItems);
  };

  const returnEquipmentToLocation = (targetLocationId: string) => {
    const deployedItems = data.equipmentItems.filter(
      item => item.status === 'deployed' && item.jobId === jobId
    );

    if (deployedItems.length === 0) return;

    const updatedItems = data.equipmentItems.filter(item => 
      !(item.status === 'deployed' && item.jobId === jobId)
    );

    // Return equipment to the specified location
    deployedItems.forEach(deployedItem => {
      const availableItem = updatedItems.find(
        item => 
          item.typeId === deployedItem.typeId && 
          item.locationId === targetLocationId && 
          item.status === 'available'
      );

      if (availableItem) {
        availableItem.quantity += deployedItem.quantity;
        availableItem.lastUpdated = new Date();
      } else {
        // Create new available item at target location
        updatedItems.push({
          id: `returned-${deployedItem.typeId}-${targetLocationId}-${Date.now()}`,
          typeId: deployedItem.typeId,
          locationId: targetLocationId,
          quantity: deployedItem.quantity,
          status: 'available',
          lastUpdated: new Date(),
        });
      }

      // Create audit entry for equipment return with location transfer
      addAuditEntry({
        action: 'return',
        entityType: 'equipment',
        entityId: deployedItem.typeId,
        details: {
          quantity: deployedItem.quantity,
          fromLocation: deployedItem.locationId,
          toLocation: targetLocationId,
          jobId,
        },
        metadata: { source: 'manual' },
      });
    });

    updateEquipmentItems(updatedItems);
    
    const locationName = data.storageLocations.find(loc => loc.id === targetLocationId)?.name || 'Unknown';
    toast.success(`Equipment returned to ${locationName}`);
  };

  // Auto-sync when diagram changes
  useEffect(() => {
    if (isAutoSyncEnabled && (nodes.length > 0 || edges.length > 0)) {
      // Find the source location for this job
      const deployedItems = data.equipmentItems.filter(
        item => item.status === 'deployed' && item.jobId === jobId
      );
      
      if (deployedItems.length > 0) {
        const sourceLocationId = deployedItems[0].locationId;
        autoAllocateEquipment(sourceLocationId);
      }
    }
  }, [nodes, edges, isAutoSyncEnabled]);

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
