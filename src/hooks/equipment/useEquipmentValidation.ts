
import { useInventoryData } from '@/hooks/useInventoryData';
import { useComprehensiveEquipmentTracking } from './useComprehensiveEquipmentTracking';
import { toast } from 'sonner';

export const useEquipmentValidation = (jobId: string, nodes: any[], edges: any[]) => {
  const { data } = useInventoryData();
  const { analyzeEquipmentUsage } = useComprehensiveEquipmentTracking(nodes, edges);

  const validateInventoryConsistency = () => {
    const usage = analyzeEquipmentUsage();
    const deployedItems = data.equipmentItems.filter(
      item => item.status === 'deployed' && item.jobId === jobId
    );

    const inconsistencies: string[] = [];
    const warnings: string[] = [];

    // Check if deployed quantities match diagram requirements
    Object.entries(usage.cables).forEach(([typeId, details]) => {
      const deployed = deployedItems
        .filter(item => item.typeId === typeId)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (deployed !== details.quantity) {
        const equipmentType = data.equipmentTypes.find(type => type.id === typeId);
        if (deployed > details.quantity) {
          warnings.push(
            `${equipmentType?.name}: ${deployed} deployed but only ${details.quantity} required`
          );
        } else {
          inconsistencies.push(
            `${equipmentType?.name}: Diagram requires ${details.quantity}, but only ${deployed} deployed`
          );
        }
      }
    });

    // Check other equipment types
    const equipmentChecks = [
      { typeId: '7', usage: usage.gauges, name: 'Pressure Gauges' },
      { typeId: '9', usage: usage.adapters, name: 'Y Adapters' },
      { typeId: '11', usage: usage.computers, name: 'Company Computers' },
      { typeId: '10', usage: usage.satellite, name: 'Satellite Equipment' },
    ];

    equipmentChecks.forEach(({ typeId, usage: requiredQuantity, name }) => {
      if (requiredQuantity > 0) {
        const deployed = deployedItems
          .filter(item => item.typeId === typeId)
          .reduce((sum, item) => sum + item.quantity, 0);

        if (deployed !== requiredQuantity) {
          if (deployed > requiredQuantity) {
            warnings.push(
              `${name}: ${deployed} deployed but only ${requiredQuantity} required`
            );
          } else {
            inconsistencies.push(
              `${name}: Diagram requires ${requiredQuantity}, but only ${deployed} deployed`
            );
          }
        }
      }
    });

    // Provide user feedback based on validation results
    if (inconsistencies.length > 0) {
      console.warn('Equipment inconsistencies detected:', inconsistencies);
      toast.error(`Equipment shortfalls: ${inconsistencies.length} items need attention`);
      return false;
    }

    if (warnings.length > 0) {
      console.warn('Equipment warnings detected:', warnings);
      toast.warning(`Equipment over-allocation: ${warnings.length} items have excess`);
      return true; // Still consistent, just over-allocated
    }

    if (deployedItems.length > 0) {
      toast.success('Equipment allocation is perfectly consistent');
    }

    return true;
  };

  const getEquipmentSummary = () => {
    const usage = analyzeEquipmentUsage();
    const deployedItems = data.equipmentItems.filter(
      item => item.status === 'deployed' && item.jobId === jobId
    );

    const summary = {
      required: usage,
      deployed: deployedItems,
      isConsistent: validateInventoryConsistency(),
      totalRequired: Object.values(usage.cables).reduce((sum, cable) => sum + cable.quantity, 0) + 
                    usage.gauges + usage.adapters + usage.computers + usage.satellite,
      totalDeployed: deployedItems.reduce((sum, item) => sum + item.quantity, 0),
    };

    return summary;
  };

  const performQuickValidationFix = () => {
    const summary = getEquipmentSummary();
    
    if (summary.isConsistent) {
      toast.info('Equipment allocation is already consistent');
      return true;
    }

    // For now, just provide feedback about what needs to be fixed
    // In a full implementation, this could auto-fix some issues
    toast.info('Use the Quick Allocate feature to resolve equipment issues');
    return false;
  };

  return {
    validateInventoryConsistency,
    getEquipmentSummary,
    performQuickValidationFix,
    analyzeEquipmentUsage,
  };
};
