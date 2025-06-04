
import { EquipmentItem, IndividualEquipment } from '@/types/inventory';

export const useSupabaseEquipmentUtils = (
  equipmentItems: EquipmentItem[],
  individualEquipment: IndividualEquipment[]
) => {
  // Query functions
  const getEquipmentByType = (typeId: string) => {
    return equipmentItems.filter(item => item.typeId === typeId);
  };

  const getIndividualEquipmentByType = (typeId: string) => {
    return individualEquipment.filter(equipment => equipment.typeId === typeId);
  };

  const getEquipmentByLocation = (locationId: string) => {
    return equipmentItems.filter(item => item.locationId === locationId);
  };

  const getIndividualEquipmentByLocation = (locationId: string) => {
    return individualEquipment.filter(equipment => equipment.locationId === locationId);
  };

  const getEquipmentByStatus = (status: string) => {
    return equipmentItems.filter(item => item.status === status);
  };

  const getIndividualEquipmentByStatus = (status: string) => {
    return individualEquipment.filter(equipment => equipment.status === status);
  };

  const getTotalQuantityByType = (typeId: string) => {
    return equipmentItems
      .filter(item => item.typeId === typeId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const getAvailableQuantityByType = (typeId: string) => {
    return equipmentItems
      .filter(item => item.typeId === typeId && item.status === 'available')
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  return {
    getEquipmentByType,
    getIndividualEquipmentByType,
    getEquipmentByLocation,
    getIndividualEquipmentByLocation,
    getEquipmentByStatus,
    getIndividualEquipmentByStatus,
    getTotalQuantityByType,
    getAvailableQuantityByType,
  };
};
