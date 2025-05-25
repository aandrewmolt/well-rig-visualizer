
import { useInventoryData } from '@/hooks/useInventoryData';
import { DetailedEquipmentUsage } from './useEquipmentUsageAnalyzer';

export const useEquipmentAvailabilityChecker = () => {
  const { data } = useInventoryData();

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

  return {
    validateEquipmentAvailability,
  };
};
