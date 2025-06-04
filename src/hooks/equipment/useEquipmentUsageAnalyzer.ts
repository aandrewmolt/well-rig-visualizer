
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

    // Create a fallback equipment type lookup for missing types
    const createFallbackEquipmentType = (typeId: string, label: string) => {
      const name = label.toLowerCase();
      let length = '200ft'; // default
      let category: 'cables' | 'gauges' | 'adapters' | 'communication' | 'power' | 'other' = 'cables';
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
      
      if (name.includes('reel')) category = 'other';

      return {
        id: typeId,
        name: label,
        category,
        length,
        version,
      };
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
        // Count cables based on their actual type
        const originalCableTypeId = edgeData.cableTypeId;
        let migratedCableTypeId = migrateCableTypeId(originalCableTypeId);
        
        // Map cable types based on actual label for accurate counting
        const label = edgeData.label?.toLowerCase() || '';
        if (label.includes('100ft')) {
          migratedCableTypeId = '1'; // 100ft cable type ID
        } else if (label.includes('200ft')) {
          migratedCableTypeId = '2'; // 200ft cable type ID
        } else if (label.includes('300ft')) {
          migratedCableTypeId = '4'; // 300ft cable type ID
        }
        
        console.log(`Cable connection found: ${edge.id}, label: ${edgeData.label}, type: ${originalCableTypeId} -> ${migratedCableTypeId}`);
        
        let equipmentType = data.equipmentTypes.find(type => type.id === migratedCableTypeId);
        
        // If equipment type not found, create a fallback
        if (!equipmentType) {
          console.warn(`Cable type ${migratedCableTypeId} not found in equipment types, creating fallback`);
          const fallback = createFallbackEquipmentType(migratedCableTypeId, edgeData.label || 'Cable');
          equipmentType = {
            id: migratedCableTypeId,
            name: fallback.name,
            category: fallback.category,
            description: null,
            requiresIndividualTracking: false,
            defaultIdPrefix: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        
        if (equipmentType) {
          if (!usage.cables[migratedCableTypeId]) {
            // Enhanced cable characteristic detection
            const name = equipmentType.name.toLowerCase();
            let length = '200ft'; // default
            let category = 'cables';
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
        }
      } else {
        // Check if this edge has a label that indicates it's a cable
        // Fix: Safely handle edge.label which can be ReactNode or undefined
        const edgeLabel = typeof edge.label === 'string' ? edge.label : '';
        const dataLabel = edgeData?.label || '';
        const label = (dataLabel || edgeLabel).toLowerCase();
        
        if (label.includes('cable') && !label.includes('direct')) {
          // This is a cable connection based on label
          let cableTypeId = '2'; // Default to 200ft
          
          if (label.includes('100ft')) {
            cableTypeId = '1';
          } else if (label.includes('200ft')) {
            cableTypeId = '2';
          } else if (label.includes('300ft')) {
            cableTypeId = '4';
          }
          
          let equipmentType = data.equipmentTypes.find(type => type.id === cableTypeId);
          
          // If equipment type not found, create a fallback
          if (!equipmentType) {
            console.warn(`Cable type ${cableTypeId} not found in equipment types, creating fallback`);
            const fallback = createFallbackEquipmentType(cableTypeId, dataLabel || edgeLabel || 'Cable');
            equipmentType = {
              id: cableTypeId,
              name: fallback.name,
              category: fallback.category,
              description: null,
              requiresIndividualTracking: false,
              defaultIdPrefix: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          }
          
          if (equipmentType) {
            if (!usage.cables[cableTypeId]) {
              const name = equipmentType.name.toLowerCase();
              let length = '200ft';
              let category = 'cables';
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

              usage.cables[cableTypeId] = {
                typeName: equipmentType.name,
                quantity: 0,
                category,
                length,
                version,
              };
            }
            usage.cables[cableTypeId].quantity++;
          }
        } else if (label.includes('direct') || edge.type === 'direct') {
          // Direct connection
          usage.directConnections++;
          console.log(`Inferred direct connection from label: ${edge.id}`);
        } else {
          // Default to direct connection if no clear cable indication
          usage.directConnections++;
          console.log(`Inferred direct connection (no cable indicators): ${edge.id}`);
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
