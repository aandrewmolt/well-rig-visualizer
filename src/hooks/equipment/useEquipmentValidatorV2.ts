
import { useCallback } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { DetailedEquipmentUsage } from './useEquipmentUsageAnalyzer';

export const useEquipmentValidatorV2 = (jobId: string) => {
  const { data } = useInventory();

  const validateInventoryConsistency = useCallback((usage: DetailedEquipmentUsage) => {
    const deployedItems = data.individualEquipment.filter(
      item => item.status === 'deployed' && item.jobId === jobId
    );

    const requiredQuantities: { [typeId: string]: number } = {};

    // Calculate required quantities
    Object.entries(usage.cables).forEach(([typeId, details]) => {
      requiredQuantities[typeId] = details.quantity;
    });

    // Add other equipment requirements
    if (usage.gauges > 0) requiredQuantities['pressure-gauge-1502'] = usage.gauges;
    if (usage.adapters > 0) requiredQuantities['y-adapter'] = usage.adapters;
    if (usage.computers > 0) requiredQuantities['customer-computer'] = usage.computers;
    if (usage.satellite > 0) requiredQuantities['starlink'] = usage.satellite;

    // Check consistency
    let isConsistent = true;
    Object.entries(requiredQuantities).forEach(([typeId, required]) => {
      const deployed = deployedItems
        .filter(item => item.typeId === typeId)
        .length;
      
      if (deployed !== required) {
        isConsistent = false;
      }
    });

    return isConsistent;
  }, [jobId, data.individualEquipment]);

  const validateEquipmentAvailability = useCallback((usage: DetailedEquipmentUsage, locationId: string) => {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check cable availability
    Object.entries(usage.cables).forEach(([typeId, details]) => {
      if (details.quantity > 0) {
        const availableEquipment = data.individualEquipment.filter(
          eq => eq.typeId === typeId && eq.locationId === locationId && eq.status === 'available'
        );

        if (availableEquipment.length < details.quantity) {
          issues.push(`Insufficient ${details.typeName} (need ${details.quantity}, have ${availableEquipment.length})`);
        }
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
        const availableEquipment = data.individualEquipment.filter(
          eq => eq.typeId === typeId && eq.locationId === locationId && eq.status === 'available'
        );

        if (availableEquipment.length < quantity) {
          issues.push(`Insufficient ${name} (need ${quantity}, have ${availableEquipment.length})`);
        }
      }
    });

    return { issues, warnings };
  }, [data.individualEquipment]);

  return {
    validateInventoryConsistency,
    validateEquipmentAvailability
  };
};
