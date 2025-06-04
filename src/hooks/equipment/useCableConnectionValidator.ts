
import { Node } from '@xyflow/react';
import { useInventoryData } from '@/hooks/useInventoryData';

export interface CableConnectionRule {
  cableTypeId: string;
  cableName: string;
  allowedConnections: {
    from: string[];
    to: string[];
  };
  version?: 'old' | 'new';
}

export const useCableConnectionValidator = () => {
  const { data } = useInventoryData();

  const getCableConnectionRules = (): CableConnectionRule[] => {
    return data.equipmentTypes
      .filter(type => type.category === 'cables')
      .map(cableType => {
        const name = cableType.name.toLowerCase();
        
        if (name.includes('100ft')) {
          return {
            cableTypeId: cableType.id,
            cableName: cableType.name,
            allowedConnections: {
              from: ['mainBox', 'yAdapter'],
              to: ['well', 'wellsideGauge', 'yAdapter']
            }
          };
        } else if (name.includes('200ft')) {
          return {
            cableTypeId: cableType.id,
            cableName: cableType.name,
            allowedConnections: {
              from: ['mainBox'],
              to: ['well', 'wellsideGauge']
            }
          };
        } else if (name.includes('300ft')) {
          // Determine if it's old or new version
          const isOldVersion = name.includes('old') || name.includes('y adapter') || 
                              name.includes('reel') && !name.includes('new');
          
          if (isOldVersion) {
            return {
              cableTypeId: cableType.id,
              cableName: cableType.name,
              allowedConnections: {
                from: ['mainBox'],
                to: ['yAdapter']
              },
              version: 'old'
            };
          } else {
            return {
              cableTypeId: cableType.id,
              cableName: cableType.name,
              allowedConnections: {
                from: ['mainBox'],
                to: ['well', 'wellsideGauge']
              },
              version: 'new'
            };
          }
        }
        
        // Default fallback
        return {
          cableTypeId: cableType.id,
          cableName: cableType.name,
          allowedConnections: {
            from: ['mainBox'],
            to: ['well', 'wellsideGauge']
          }
        };
      });
  };

  const validateConnection = (
    sourceNode: Node | undefined,
    targetNode: Node | undefined,
    cableTypeId: string
  ): { isValid: boolean; reason?: string } => {
    if (!sourceNode || !targetNode) {
      return { isValid: false, reason: 'Source or target node not found' };
    }

    // Special case: Y Adapters cannot connect directly to Main Box
    if (sourceNode.type === 'yAdapter' && targetNode.type === 'mainBox') {
      return { isValid: false, reason: 'Y Adapters cannot connect directly to Main Box' };
    }

    if (targetNode.type === 'yAdapter' && sourceNode.type === 'mainBox') {
      // Only certain cables can connect Main Box to Y Adapter
      const rules = getCableConnectionRules();
      const rule = rules.find(r => r.cableTypeId === cableTypeId);
      
      if (!rule) {
        return { isValid: false, reason: 'Cable type not found' };
      }

      // Only 300ft old and 100ft cables can connect to Y Adapter from Main Box
      const name = rule.cableName.toLowerCase();
      const is300ftOld = name.includes('300ft') && (name.includes('old') || name.includes('y adapter') || name.includes('reel') && !name.includes('new'));
      const is100ft = name.includes('100ft');
      
      if (!is300ftOld && !is100ft) {
        return { isValid: false, reason: `${rule.cableName} cannot connect to Y Adapter (only 300ft Old and 100ft cables allowed)` };
      }
    }

    const rules = getCableConnectionRules();
    const rule = rules.find(r => r.cableTypeId === cableTypeId);
    
    if (!rule) {
      return { isValid: false, reason: 'Cable type not found' };
    }

    const sourceTypeValid = rule.allowedConnections.from.includes(sourceNode.type!);
    const targetTypeValid = rule.allowedConnections.to.includes(targetNode.type!);

    if (!sourceTypeValid) {
      return { 
        isValid: false, 
        reason: `${rule.cableName} cannot originate from ${sourceNode.type}` 
      };
    }

    if (!targetTypeValid) {
      return { 
        isValid: false, 
        reason: `${rule.cableName} cannot connect to ${targetNode.type}` 
      };
    }

    return { isValid: true };
  };

  const getValidCablesForConnection = (
    sourceNode: Node | undefined,
    targetNode: Node | undefined
  ): CableConnectionRule[] => {
    if (!sourceNode || !targetNode) return [];

    const rules = getCableConnectionRules();
    return rules.filter(rule => {
      const validation = validateConnection(sourceNode, targetNode, rule.cableTypeId);
      return validation.isValid;
    });
  };

  return {
    getCableConnectionRules,
    validateConnection,
    getValidCablesForConnection,
  };
};
