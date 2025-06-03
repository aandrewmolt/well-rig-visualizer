
import { EquipmentItem, IndividualEquipment } from '@/types/inventory';

export const useSupabaseEquipmentUtils = (
  equipmentItems: EquipmentItem[],
  individualEquipment: IndividualEquipment[]
) => {
  return {
    getEquipmentByType: (typeId: string) => {
      return equipmentItems.filter(item => item.typeId === typeId);
    },

    getIndividualEquipmentByType: (typeId: string) => {
      return individualEquipment.filter(equipment => equipment.typeId === typeId);
    },

    getEquipmentByLocation: (locationId: string) => {
      return equipmentItems.filter(item => item.locationId === locationId);
    },

    getIndividualEquipmentByLocation: (locationId: string) => {
      return individualEquipment.filter(equipment => equipment.locationId === locationId);
    },
  };
};
