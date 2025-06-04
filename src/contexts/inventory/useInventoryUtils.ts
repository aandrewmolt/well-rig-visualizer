
export const useInventoryUtils = (equipmentTypes: any[], storageLocations: any[], equipmentItems: any[]) => {
  // Utility functions
  const getEquipmentTypeName = (typeId: string): string => {
    const type = equipmentTypes.find(t => t.id === typeId);
    return type?.name || 'Unknown Type';
  };

  const getLocationName = (locationId: string): string => {
    const location = storageLocations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const getDeployedQuantityByType = (typeId: string): number => {
    return equipmentItems
      .filter(item => item.typeId === typeId && item.status === 'deployed')
      .reduce((total, item) => total + item.quantity, 0);
  };

  return {
    getEquipmentTypeName,
    getLocationName,
    getDeployedQuantityByType,
  };
};
