
import { useState, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useInventoryData } from './useInventoryData';
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

interface ExtrasOnLocation {
  id: string;
  equipmentTypeId: string;
  quantity: number;
  reason: string;
  addedDate: Date;
  notes?: string;
}

export const useEquipmentTracking = (jobId: string, nodes: Node[], edges: Edge[]) => {
  const { data, updateEquipmentItems } = useInventoryData();
  const [usage, setUsage] = useState<EquipmentUsage>({
    cables: {},
    gauges: 0,
    adapters: 0,
    computers: 0,
    satellite: 0,
  });
  const [extrasOnLocation, setExtrasOnLocation] = useState<ExtrasOnLocation[]>([]);
  const [lastAutoAllocation, setLastAutoAllocation] = useState<string>('');

  const calculateEquipmentUsage = () => {
    const newUsage: EquipmentUsage = {
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
      newUsage.cables[cableType] = (newUsage.cables[cableType] || 0) + 1;
    });

    // Count equipment from nodes
    nodes.forEach(node => {
      switch (node.type) {
        case 'well':
          newUsage.gauges += 1; // Each well has 1 gauge
          break;
        case 'wellsideGauge':
          newUsage.gauges += 1;
          break;
        case 'yAdapter':
          newUsage.adapters += 1;
          break;
        case 'companyComputer':
          newUsage.computers += 1;
          break;
        case 'satellite':
          newUsage.satellite += 1;
          break;
      }
    });

    setUsage(newUsage);
    return newUsage;
  };

  const autoAllocateEquipment = (locationId: string) => {
    if (!locationId) return;

    const currentUsage = calculateEquipmentUsage();
    const usageKey = JSON.stringify({ nodes: nodes.length, edges: edges.length, locationId });
    
    // Only auto-allocate if the diagram or location changed
    if (usageKey === lastAutoAllocation) return;

    // First, return any previously allocated equipment for this job
    returnAllJobEquipment();

    const updatedItems = [...data.equipmentItems];

    // Allocate cables
    Object.entries(currentUsage.cables).forEach(([cableType, quantity]) => {
      const typeMapping: { [key: string]: string } = {
        '100ft': '1',
        '200ft': '2',
        '300ft': '4',
      };
      
      const typeId = typeMapping[cableType];
      if (typeId) {
        allocateEquipmentType(updatedItems, typeId, quantity, locationId);
      }
    });

    // Allocate gauges (1502 Pressure Gauge)
    if (currentUsage.gauges > 0) {
      allocateEquipmentType(updatedItems, '7', currentUsage.gauges, locationId);
    }

    // Allocate Y adapters
    if (currentUsage.adapters > 0) {
      allocateEquipmentType(updatedItems, '9', currentUsage.adapters, locationId);
    }

    // Allocate company computers
    if (currentUsage.computers > 0) {
      allocateEquipmentType(updatedItems, '11', currentUsage.computers, locationId);
    }

    // Allocate satellite
    if (currentUsage.satellite > 0) {
      allocateEquipmentType(updatedItems, '10', currentUsage.satellite, locationId);
    }

    updateEquipmentItems(updatedItems);
    setLastAutoAllocation(usageKey);
    toast.success('Equipment automatically allocated from diagram');
  };

  const allocateEquipmentType = (updatedItems: any[], typeId: string, quantity: number, locationId: string) => {
    const availableItem = updatedItems.find(
      item => item.typeId === typeId && item.locationId === locationId && item.status === 'available'
    );
    
    if (availableItem && availableItem.quantity >= quantity) {
      availableItem.quantity -= quantity;
      
      // Add deployed record
      updatedItems.push({
        id: `deployed-${typeId}-${Date.now()}-${Math.random()}`,
        typeId,
        locationId,
        quantity,
        status: 'deployed',
        jobId,
        lastUpdated: new Date(),
      });
    } else {
      const typeName = data.equipmentTypes.find(type => type.id === typeId)?.name || 'Unknown';
      toast.error(`Insufficient ${typeName} available at selected location`);
    }
  };

  const returnAllJobEquipment = () => {
    const updatedItems = data.equipmentItems.map(item => {
      if (item.status === 'deployed' && item.jobId === jobId) {
        // Find the corresponding available item to return quantity to
        const availableItem = data.equipmentItems.find(
          availItem => 
            availItem.typeId === item.typeId && 
            availItem.locationId === item.locationId && 
            availItem.status === 'available'
        );
        
        if (availableItem) {
          availableItem.quantity += item.quantity;
        } else {
          // Create new available item if none exists
          return {
            id: `available-${item.typeId}-${item.locationId}`,
            typeId: item.typeId,
            locationId: item.locationId,
            quantity: item.quantity,
            status: 'available' as const,
            lastUpdated: new Date(),
          };
        }
        return null; // Mark for removal
      }
      return item;
    }).filter(Boolean);

    updateEquipmentItems(updatedItems as any[]);
  };

  const addExtraEquipment = (equipmentTypeId: string, quantity: number, reason: string, notes?: string) => {
    const newExtra: ExtrasOnLocation = {
      id: `extra-${Date.now()}`,
      equipmentTypeId,
      quantity,
      reason,
      addedDate: new Date(),
      notes,
    };
    setExtrasOnLocation(prev => [...prev, newExtra]);
    toast.success('Extra equipment added to location');
  };

  const removeExtraEquipment = (extraId: string) => {
    setExtrasOnLocation(prev => prev.filter(extra => extra.id !== extraId));
    toast.success('Extra equipment removed');
  };

  const transferEquipment = (typeId: string, quantity: number, fromLocationId: string, toLocationId: string, transferDate?: Date) => {
    const updatedItems = [...data.equipmentItems];
    
    // Find source item
    const sourceItem = updatedItems.find(
      item => item.typeId === typeId && item.locationId === fromLocationId && item.status === 'available'
    );
    
    if (!sourceItem || sourceItem.quantity < quantity) {
      toast.error('Insufficient equipment at source location');
      return;
    }

    // Deduct from source
    sourceItem.quantity -= quantity;
    
    // Add to destination
    const destItem = updatedItems.find(
      item => item.typeId === typeId && item.locationId === toLocationId && item.status === 'available'
    );
    
    if (destItem) {
      destItem.quantity += quantity;
    } else {
      updatedItems.push({
        id: `transfer-${Date.now()}`,
        typeId,
        locationId: toLocationId,
        quantity,
        status: 'available',
        lastUpdated: transferDate || new Date(),
      });
    }

    updateEquipmentItems(updatedItems);
    toast.success('Equipment transferred successfully');
  };

  // Auto-allocate when diagram changes
  useEffect(() => {
    calculateEquipmentUsage();
  }, [nodes, edges]);

  return { 
    usage, 
    extrasOnLocation,
    autoAllocateEquipment,
    returnAllJobEquipment,
    addExtraEquipment,
    removeExtraEquipment,
    transferEquipment,
    calculateEquipmentUsage 
  };
};
