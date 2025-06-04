
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
          inconsistencies.push(
            `${name}: Diagram requires ${requiredQuantity}, but ${deployed} deployed`
          );
        }
      }
    });

    if (inconsistencies.length > 0) {
      console.warn('Inventory inconsistencies detected:', inconsistencies);
      toast.warning(`Inventory inconsistencies: ${inconsistencies.join(', ')}`);
      return false;
    }

    return true;
  };

  const getEquipmentSummary = () => {
    const usage = analyzeEquipmentUsage();
    const deployedItems = data.equipmentItems.filter(
      item => item.status === 'deployed' && item.jobId === jobId
    );

    return {
      required: usage,
      deployed: deployedItems,
      isConsistent: validateInventoryConsistency(),
    };
  };

  return {
    validateInventoryConsistency,
    getEquipmentSummary,
    analyzeEquipmentUsage,
  };
};
