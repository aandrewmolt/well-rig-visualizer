
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
              from: ['mainBox'],
              to: ['well', 'wellsideGauge']
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
          // Determine if it's old or new version based on name patterns
          const isOldVersion = name.includes('old') || name.includes('legacy') || 
                              (!name.includes('new') && !name.includes('direct'));
          
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
            to: ['well', 'wellsideGauge', 'yAdapter']
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
      const sourceValid = rule.allowedConnections.from.includes(sourceNode.type!);
      const targetValid = rule.allowedConnections.to.includes(targetNode.type!);
      return sourceValid && targetValid;
    });
  };

  return {
    getCableConnectionRules,
    validateConnection,
    getValidCablesForConnection,
  };
};
