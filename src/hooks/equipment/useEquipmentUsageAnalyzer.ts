
import { Node, Edge } from '@xyflow/react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { migrateCableTypeId } from '@/utils/cableTypeMigration';
import { toast } from 'sonner';

interface EdgeData {
  connectionType?: 'cable' | 'direct';
  cableTypeId?: string;
  label?: string;
}

export interface DetailedEquipmentUsage {
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

export const useEquipmentUsageAnalyzer = (nodes: Node[], edges: Edge[]) => {
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

      // Only count as direct connection if explicitly marked as direct
      if (edgeData?.connectionType === 'direct' || edge.type === 'direct') {
        usage.directConnections++;
        console.log(`Direct connection found (no cable used): ${edge.id}`, edgeData);
      } else if (edgeData?.connectionType === 'cable' && typeof edgeData.cableTypeId === 'string') {
        // Count ALL cables when connectionType is 'cable', regardless of type (including 100ft)
        const originalCableTypeId = edgeData.cableTypeId;
        const migratedCableTypeId = migrateCableTypeId(originalCableTypeId);
        
        console.log(`Cable connection found: ${edge.id}, type: ${originalCableTypeId} -> ${migratedCableTypeId}`);
        
        const equipmentType = data.equipmentTypes.find(type => type.id === migratedCableTypeId);
        
        if (equipmentType) {
          if (!usage.cables[migratedCableTypeId]) {
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

            usage.cables[migratedCableTypeId] = {
              typeName: equipmentType.name,
              quantity: 0,
              category,
              length,
              version,
            };
          }
          usage.cables[migratedCableTypeId].quantity++;
        } else {
          console.warn(`Cable type ${migratedCableTypeId} (migrated from ${originalCableTypeId}) not found in equipment types`);
        }
      } else {
        // If no explicit connection type, try to infer from edge type or default to direct
        if (edge.type === 'cable' && edgeData?.cableTypeId) {
          // This is a legacy cable connection, treat as cable
          const migratedCableTypeId = migrateCableTypeId(edgeData.cableTypeId);
          const equipmentType = data.equipmentTypes.find(type => type.id === migratedCableTypeId);
          
          if (equipmentType) {
            if (!usage.cables[migratedCableTypeId]) {
              const name = equipmentType.name.toLowerCase();
              let length = '200ft';
              let category = 'cable';
              let version = undefined;
              
              if (name.includes('100ft')) length = '100ft';
              else if (name.includes('200ft')) length = '200ft';
              else if (name.includes('300ft')) {
                length = '300ft';
                if (name.includes('old') || name.includes('legacy')) {
                  version = 'old (Y adapter only)';
                } else if (name.includes('new') || name.includes('direct')) {
                  version = 'new (direct to wells)';
                }
              }
              
              if (name.includes('reel')) category = 'reel';

              usage.cables[migratedCableTypeId] = {
                typeName: equipmentType.name,
                quantity: 0,
                category,
                length,
                version,
              };
            }
            usage.cables[migratedCableTypeId].quantity++;
          }
        } else {
          // No cable type ID and not explicitly marked as cable = direct connection
          usage.directConnections++;
          console.log(`Inferred direct connection (no cable used): ${edge.id}`);
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
        case 'customerComputer':
          usage.computers++;
          break;
        case 'satellite':
          usage.satellite++;
          break;
      }
    });

    console.log('Final equipment usage analysis:', usage);
    return usage;
  };

  return {
    analyzeEquipmentUsage,
  };
};
