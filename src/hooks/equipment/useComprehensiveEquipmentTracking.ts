
import { Node, Edge } from '@xyflow/react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { toast } from 'sonner';

interface EdgeData {
  connectionType?: 'cable' | 'direct';
  cableTypeId?: string;
  label?: string;
}

interface DetailedEquipmentUsage {
  cables: {
    [typeId: string]: {
      typeName: string;
      quantity: number;
      category: string;
      length: string;
      version?: string;
    };
  };
  gauges: number;
  adapters: number;
  computers: number;
  satellite: number;
  directConnections: number;
  totalConnections: number;
}

export const useComprehensiveEquipmentTracking = (nodes: Node[], edges: Edge[]) => {
  const { data } = useInventoryData();

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

      const edgeData = edge.data as EdgeData;

      if (edgeData?.connectionType === 'direct') {
        usage.directConnections++;
      } else if (edgeData?.connectionType === 'cable' && typeof edgeData.cableTypeId === 'string') {
        const cableTypeId = edgeData.cableTypeId;
        const equipmentType = data.equipmentTypes.find(type => type.id === cableTypeId);
        
        if (equipmentType) {
          if (!usage.cables[cableTypeId]) {
            // Enhanced cable characteristic detection
            const name = equipmentType.name.toLowerCase();
            let length = '200ft'; // default
            let category = 'cable';
            let version = undefined;
            
            if (name.includes('100ft')) length = '100ft';
            else if (name.includes('200ft')) length = '200ft';
            else if (name.includes('300ft')) {
              length = '300ft';
              // Determine version for 300ft cables
              if (name.includes('old') || name.includes('legacy')) {
                version = 'old (Y adapter only)';
              } else if (name.includes('new') || name.includes('direct')) {
                version = 'new (direct to wells)';
              }
            }
            
            if (name.includes('reel')) category = 'reel';

            usage.cables[cableTypeId] = {
              typeName: equipmentType.name,
              quantity: 0,
              category,
              length,
              version,
            };
          }
          usage.cables[cableTypeId].quantity++;
        } else {
          console.warn(`Cable type ${cableTypeId} not found in equipment types`);
          toast.error(`Unknown cable type detected: ${cableTypeId}`);
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

  const validateEquipmentAvailability = (usage: DetailedEquipmentUsage, locationId: string) => {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check cable availability with enhanced details
    Object.entries(usage.cables).forEach(([typeId, details]) => {
      const available = data.equipmentItems
        .filter(item => 
          item.typeId === typeId && 
          item.locationId === locationId && 
          item.status === 'available'
        )
        .reduce((sum, item) => sum + item.quantity, 0);

      const deployed = data.equipmentItems
        .filter(item => 
          item.typeId === typeId && 
          item.status === 'deployed'
        )
        .reduce((sum, item) => sum + item.quantity, 0);

      const typeDescription = `${details.typeName}${details.version ? ` (${details.version})` : ''}`;

      if (available < details.quantity) {
        issues.push(
          `${typeDescription}: Need ${details.quantity}, have ${available} available (${deployed} deployed elsewhere)`
        );
      } else if (available === details.quantity) {
        warnings.push(`${typeDescription}: Exact match - no spares available`);
      }
    });

    // Check other equipment types
    const equipmentChecks = [
      { typeId: '7', needed: usage.gauges, name: 'Pressure Gauges' },
      { typeId: '9', needed: usage.adapters, name: 'Y Adapters' },
      { typeId: '11', needed: usage.computers, name: 'Company Computers' },
      { typeId: '10', needed: usage.satellite, name: 'Satellite Equipment' },
    ];

    equipmentChecks.forEach(({ typeId, needed, name }) => {
      if (needed > 0) {
        const available = data.equipmentItems
          .filter(item => 
            item.typeId === typeId && 
            item.locationId === locationId && 
            item.status === 'available'
          )
          .reduce((sum, item) => sum + item.quantity, 0);

        if (available < needed) {
          issues.push(`${name}: Need ${needed}, have ${available} available`);
        }
      }
    });

    return { issues, warnings };
  };

  const generateEquipmentReport = (usage: DetailedEquipmentUsage) => {
    const report = {
      summary: {
        totalCables: Object.values(usage.cables).reduce((sum, cable) => sum + cable.quantity, 0),
        cableTypes: Object.keys(usage.cables).length,
        totalEquipment: usage.gauges + usage.adapters + usage.computers + usage.satellite,
        directConnections: usage.directConnections,
        totalConnections: usage.totalConnections,
      },
      cables: usage.cables,
      equipment: {
        gauges: usage.gauges,
        adapters: usage.adapters,
        computers: usage.computers,
        satellite: usage.satellite,
      },
    };

    console.log('Enhanced Equipment Usage Report:', report);
    return report;
  };

  return {
    analyzeEquipmentUsage,
    validateEquipmentAvailability,
    generateEquipmentReport,
  };
};
