
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

export const useEquipmentTracking = (jobId: string, nodes: Node[], edges: Edge[]) => {
  const { data, updateEquipmentItems } = useInventoryData();
  const [usage, setUsage] = useState<EquipmentUsage>({
    cables: {},
    gauges: 0,
    adapters: 0,
    computers: 0,
    satellite: 0,
  });

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

  const allocateEquipmentToJob = (locationId: string) => {
    const currentUsage = calculateEquipmentUsage();
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
        const availableItem = updatedItems.find(
          item => item.typeId === typeId && item.locationId === locationId && item.status === 'available'
        );
        
        if (availableItem && availableItem.quantity >= quantity) {
          availableItem.quantity -= quantity;
          
          // Add deployed record
          updatedItems.push({
            id: `deployed-${typeId}-${Date.now()}`,
            typeId,
            locationId,
            quantity,
            status: 'deployed',
            jobId,
            lastUpdated: new Date(),
          });
        } else {
          toast.error(`Insufficient ${cableType} cables available`);
        }
      }
    });

    // Allocate gauges (1502 Pressure Gauge)
    if (currentUsage.gauges > 0) {
      const gaugeItem = updatedItems.find(
        item => item.typeId === '7' && item.locationId === locationId && item.status === 'available'
      );
      
      if (gaugeItem && gaugeItem.quantity >= currentUsage.gauges) {
        gaugeItem.quantity -= currentUsage.gauges;
        
        updatedItems.push({
          id: `deployed-gauge-${Date.now()}`,
          typeId: '7',
          locationId,
          quantity: currentUsage.gauges,
          status: 'deployed',
          jobId,
          lastUpdated: new Date(),
        });
      } else {
        toast.error('Insufficient pressure gauges available');
      }
    }

    // Allocate Y adapters
    if (currentUsage.adapters > 0) {
      const adapterItem = updatedItems.find(
        item => item.typeId === '9' && item.locationId === locationId && item.status === 'available'
      );
      
      if (adapterItem && adapterItem.quantity >= currentUsage.adapters) {
        adapterItem.quantity -= currentUsage.adapters;
        
        updatedItems.push({
          id: `deployed-adapter-${Date.now()}`,
          typeId: '9',
          locationId,
          quantity: currentUsage.adapters,
          status: 'deployed',
          jobId,
          lastUpdated: new Date(),
        });
      } else {
        toast.error('Insufficient Y adapters available');
      }
    }

    updateEquipmentItems(updatedItems);
    toast.success('Equipment allocated to job successfully');
  };

  useEffect(() => {
    calculateEquipmentUsage();
  }, [nodes, edges]);

  return { usage, allocateEquipmentToJob, calculateEquipmentUsage };
};
