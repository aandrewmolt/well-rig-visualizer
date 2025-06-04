
import { EquipmentType, StorageLocation, EquipmentItem } from '@/types/inventory';

export const DEFAULT_EQUIPMENT_TYPES: EquipmentType[] = [
  {
    id: '1',
    name: '100ft Cable',
    category: 'cables',
    requiresIndividualTracking: false,
  },
  {
    id: '2',
    name: '200ft Cable',
    category: 'cables',
    requiresIndividualTracking: false,
  },
  {
    id: '4',
    name: '300ft Cable (New Version)',
    category: 'cables',
    requiresIndividualTracking: false,
  },
  {
    id: '7',
    name: '1502 Pressure Gauge',
    category: 'gauges',
    requiresIndividualTracking: true,
    defaultIdPrefix: 'PG-',
  },
  {
    id: '9',
    name: 'Y Adapter Cable',
    category: 'adapters',
    requiresIndividualTracking: false,
  },
  {
    id: '10',
    name: 'Starlink',
    category: 'communication',
    requiresIndividualTracking: true,
    defaultIdPrefix: 'SL',
  },
  {
    id: '11',
    name: 'Customer Computer',
    category: 'communication',
    requiresIndividualTracking: true,
    defaultIdPrefix: 'CC',
  },
  {
    id: '12',
    name: 'ShearStream Box',
    category: 'communication',
    requiresIndividualTracking: true,
    defaultIdPrefix: 'SS',
  },
];

export const DEFAULT_STORAGE_LOCATIONS: StorageLocation[] = [
  {
    id: '1',
    name: 'Main Warehouse',
    address: '123 Storage St, Equipment City, TX 12345',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Field Office A',
    address: '456 Field Rd, Remote Location, TX 67890',
    isDefault: false,
  },
  {
    id: '3',
    name: 'Service Truck #1',
    address: 'Mobile Unit',
    isDefault: false,
  },
];

export const useInventoryDefaults = () => {
  const createDefaultInventory = (): EquipmentItem[] => {
    return [
      // Cables at Main Warehouse
      { id: '1', typeId: '1', locationId: '1', quantity: 50, status: 'available', lastUpdated: new Date() },
      { id: '2', typeId: '2', locationId: '1', quantity: 30, status: 'available', lastUpdated: new Date() },
      { id: '3', typeId: '4', locationId: '1', quantity: 20, status: 'available', lastUpdated: new Date() },
      
      // Adapters
      { id: '4', typeId: '9', locationId: '1', quantity: 15, status: 'available', lastUpdated: new Date() },
      
      // Some deployed cables
      { id: '5', typeId: '1', locationId: '2', quantity: 10, status: 'deployed', lastUpdated: new Date() },
      { id: '6', typeId: '2', locationId: '3', quantity: 5, status: 'deployed', lastUpdated: new Date() },
    ];
  };

  const resetToDefaultInventory = () => {
    const defaultData = {
      equipmentTypes: DEFAULT_EQUIPMENT_TYPES,
      storageLocations: DEFAULT_STORAGE_LOCATIONS,
      equipmentItems: createDefaultInventory(),
      individualEquipment: [],
      lastSync: new Date(),
    };
    return defaultData;
  };

  return {
    DEFAULT_EQUIPMENT_TYPES,
    DEFAULT_STORAGE_LOCATIONS,
    createDefaultInventory,
    resetToDefaultInventory,
  };
};
