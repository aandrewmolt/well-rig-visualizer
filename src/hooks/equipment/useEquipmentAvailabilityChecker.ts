
import { useInventoryData } from '@/hooks/useInventoryData';
import { DetailedEquipmentUsage } from './useEquipmentUsageAnalyzer';

interface AvailabilityValidation {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  availability: { [typeId: string]: { required: number; available: number; sufficient: boolean } };
}

export const useEquipmentAvailabilityChecker = () => {
  const { data } = useInventoryData();

  const validateEquipmentAvailability = (usage: DetailedEquipmentUsage, locationId: string): AvailabilityValidation => {
    const validation: AvailabilityValidation = {
      isValid: true,
      issues: [],
      warnings: [],
      availability: {}
    };

    // Check cable availability
    Object.entries(usage.cables).forEach(([typeId, details]) => {
      const availableItems = data.equipmentItems.filter(
        item => 
          item.typeId === typeId && 
          item.locationId === locationId && 
          item.status === 'available'
      );

      const availableQuantity = availableItems.reduce((sum, item) => sum + item.quantity, 0);
      const required = details.quantity;

      validation.availability[typeId] = {
        required,
        available: availableQuantity,
        sufficient: availableQuantity >= required
      };

      if (availableQuantity < required) {
        validation.isValid = false;
        validation.issues.push(`Insufficient ${details.typeName}: need ${required}, have ${availableQuantity}`);
      } else if (availableQuantity === required) {
        validation.warnings.push(`Exact quantity available for ${details.typeName}: ${availableQuantity}`);
      }
    });

    // Check other equipment availability
    const equipmentChecks = [
      { typeId: 'pressure-gauge-1502', quantity: usage.gauges, name: '1502 Pressure Gauge' },
      { typeId: 'y-adapter', quantity: usage.adapters, name: 'Y Adapter' },
      { typeId: 'customer-computer', quantity: usage.computers, name: 'Customer Computer' },
      { typeId: 'starlink', quantity: usage.satellite, name: 'Starlink' },
    ];

    equipmentChecks.forEach(({ typeId, quantity, name }) => {
      if (quantity > 0) {
        // Check bulk equipment
        const availableItems = data.equipmentItems.filter(
          item => 
            item.typeId === typeId && 
            item.locationId === locationId && 
            item.status === 'available'
        );
        const bulkQuantity = availableItems.reduce((sum, item) => sum + item.quantity, 0);

        // Check individual equipment
        const availableIndividualItems = data.individualEquipment.filter(
          item => 
            item.typeId === typeId && 
            item.locationId === locationId && 
            item.status === 'available'
        );
        const individualQuantity = availableIndividualItems.length;

        // Total available is bulk + individual
        const availableQuantity = bulkQuantity + individualQuantity;

        validation.availability[typeId] = {
          required: quantity,
          available: availableQuantity,
          sufficient: availableQuantity >= quantity
        };

        if (availableQuantity < quantity) {
          validation.isValid = false;
          validation.issues.push(`Insufficient ${name}: need ${quantity}, have ${availableQuantity}`);
        }
      }
    });

    return validation;
  };

  return {
    validateEquipmentAvailability
  };
};
