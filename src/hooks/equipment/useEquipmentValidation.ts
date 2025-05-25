
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

    if (inconsistencies.length > 0) {
      console.warn('Inventory inconsistencies detected:', inconsistencies);
      toast.warning(`Inventory inconsistencies: ${inconsistencies.join(', ')}`);
      return false;
    }

    return true;
  };

  return {
    validateInventoryConsistency,
  };
};
