
import { useCallback } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { toast } from 'sonner';
import { DetailedEquipmentUsage } from './useEquipmentUsageAnalyzer';

export const useEquipmentAllocatorV2 = (jobId: string) => {
  const { data, updateIndividualEquipment } = useInventory();

  const allocateEquipmentFromUsage = useCallback((usage: DetailedEquipmentUsage, locationId: string) => {
    const allocatedItems: string[] = [];

    // Allocate individual equipment items based on analysis
    Object.entries(usage.cables).forEach(([typeId, details]) => {
      if (details.quantity > 0) {
        // Find available equipment of this type
        const availableEquipment = data.individualEquipment.filter(
          eq => eq.typeId === typeId && eq.locationId === locationId && eq.status === 'available'
        );

        if (availableEquipment.length >= details.quantity) {
          // Deploy the required quantity
          for (let i = 0; i < details.quantity; i++) {
            updateIndividualEquipment(availableEquipment[i].id, {
              status: 'deployed',
              jobId: jobId
            });
          }
          allocatedItems.push(`${details.quantity}x ${details.typeName}`);
        } else {
          toast.error(`Insufficient ${details.typeName} at selected location`);
        }
      }
    });

    // Allocate other equipment types
    const equipmentAllocations = [
      { typeId: '7', quantity: usage.gauges, name: '1502 Pressure Gauge' },
      { typeId: '9', quantity: usage.adapters, name: 'Y Adapters' },
      { typeId: '11', quantity: usage.computers, name: 'Customer Computer' },
      { typeId: '10', quantity: usage.satellite, name: 'Starlink' },
    ];

    equipmentAllocations.forEach(({ typeId, quantity, name }) => {
      if (quantity > 0) {
        const availableEquipment = data.individualEquipment.filter(
          eq => eq.typeId === typeId && eq.locationId === locationId && eq.status === 'available'
        );

        if (availableEquipment.length >= quantity) {
          for (let i = 0; i < quantity; i++) {
            updateIndividualEquipment(availableEquipment[i].id, {
              status: 'deployed',
              jobId: jobId
            });
          }
          allocatedItems.push(`${quantity}x ${name}`);
        } else {
          toast.error(`Insufficient ${name} at selected location`);
        }
      }
    });

    return allocatedItems;
  }, [jobId, data.individualEquipment, updateIndividualEquipment]);

  return {
    allocateEquipmentFromUsage
  };
};
