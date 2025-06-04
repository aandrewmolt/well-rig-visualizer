import { EquipmentType, StorageLocation, EquipmentItem } from '@/types/inventory';

export const DEFAULT_EQUIPMENT_TYPES: EquipmentType[] = [
  // Standard Cable Types
  {
    id: '1',
    name: '100ft Cable',
    category: 'cables',
    description: '100 foot standard cable for short distance connections',
    requiresIndividualTracking: false,
  },
  {
    id: '2',
    name: '200ft Cable',
    category: 'cables',
    description: '200 foot standard cable for medium distance connections',
    requiresIndividualTracking: false,
  },
  {
    id: '4',
    name: '300ft Cable (New Version)',
    category: 'cables',
    description: '300 foot new version cable - direct connection to wells',
    requiresIndividualTracking: false,
  },
  {
    id: '13',
    name: '300ft Cable (Old Version)',
    category: 'cables',
    description: '300 foot old version cable - requires Y adapter for connections',
    requiresIndividualTracking: false,
  },
  // Reel Types
  {
    id: '14',
    name: '100ft Reel',
    category: 'cables',
    description: '100 foot cable on reel for easy deployment',
    requiresIndividualTracking: false,
  },
  {
    id: '15',
    name: '200ft Reel',
    category: 'cables',
    description: '200 foot cable on reel for easy deployment',
    requiresIndividualTracking: false,
  },
  {
    id: '16',
    name: '300ft Reel (New)',
    category: 'cables',
    description: '300 foot new version cable on reel - direct connection',
    requiresIndividualTracking: false,
  },
  {
    id: '17',
    name: '300ft Reel (Old)',
    category: 'cables',
    description: '300 foot old version cable on reel - requires Y adapter',
    requiresIndividualTracking: false,
  },
  // Extended Length Cables
  {
    id: '18',
    name: '400ft Cable',
    category: 'cables',
    description: '400 foot extended length cable for long distance connections',
    requiresIndividualTracking: false,
  },
  {
    id: '19',
    name: '500ft Cable',
    category: 'cables',
    description: '500 foot extended length cable for very long distance connections',
    requiresIndividualTracking: false,
  },
  // Gauges and Sensors
  {
    id: '7',
    name: '1502 Pressure Gauge',
    category: 'gauges',
    description: 'Standard 1502 pressure gauge for well monitoring',
    requiresIndividualTracking: true,
    defaultIdPrefix: 'PG-',
  },
  {
    id: '20',
    name: 'Temperature Sensor',
    category: 'gauges',
    description: 'Temperature monitoring sensor',
    requiresIndividualTracking: true,
    defaultIdPrefix: 'TS-',
  },
  // Adapters and Connectors
  {
    id: '9',
    name: 'Y Adapter Cable',
    category: 'adapters',
    description: 'Y adapter for splitting cable connections',
    requiresIndividualTracking: false,
  },
  {
    id: '21',
    name: 'T Connector',
    category: 'adapters',
    description: 'T-style connector for cable branching',
    requiresIndividualTracking: false,
  },
  {
    id: '22',
    name: 'Straight Connector',
    category: 'adapters',
    description: 'Straight connector for cable extension',
    requiresIndividualTracking: false,
  },
  // Communication Equipment
  {
    id: '10',
    name: 'Starlink',
    category: 'communication',
    description: 'Starlink satellite communication unit',
    requiresIndividualTracking: true,
    defaultIdPrefix: 'SL-',
  },
  {
    id: '11',
    name: 'Customer Computer',
    category: 'communication',
    description: 'Customer computer for data monitoring and control',
    requiresIndividualTracking: true,
    defaultIdPrefix: 'CC-',
  },
  {
    id: '12',
    name: 'ShearStream Box',
    category: 'communication',
    description: 'ShearStream data acquisition and control box',
    requiresIndividualTracking: true,
    defaultIdPrefix: 'SS-',
  },
  {
    id: '23',
    name: 'Wireless Radio',
    category: 'communication',
    description: 'Wireless radio communication device',
    requiresIndividualTracking: true,
    defaultIdPrefix: 'WR-',
  },
  // Power and Electrical
  {
    id: '24',
    name: 'Power Supply Unit',
    category: 'power',
    description: 'Power supply unit for equipment operation',
    requiresIndividualTracking: true,
    defaultIdPrefix: 'PSU-',
  },
  {
    id: '25',
    name: 'Battery Pack',
    category: 'power',
    description: 'Rechargeable battery pack for portable operation',
    requiresIndividualTracking: true,
    defaultIdPrefix: 'BP-',
  },
  {
    id: '26',
    name: 'Power Cable',
    category: 'power',
    description: 'Power cable for electrical connections',
    requiresIndividualTracking: false,
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
      // Standard Cables at Main Warehouse
      { id: '1', typeId: '1', locationId: '1', quantity: 50, status: 'available', lastUpdated: new Date() },
      { id: '2', typeId: '2', locationId: '1', quantity: 30, status: 'available', lastUpdated: new Date() },
      { id: '3', typeId: '4', locationId: '1', quantity: 20, status: 'available', lastUpdated: new Date() },
      { id: '13', typeId: '13', locationId: '1', quantity: 15, status: 'available', lastUpdated: new Date() },
      
      // Reel Types
      { id: '14', typeId: '14', locationId: '1', quantity: 10, status: 'available', lastUpdated: new Date() },
      { id: '15', typeId: '15', locationId: '1', quantity: 8, status: 'available', lastUpdated: new Date() },
      { id: '16', typeId: '16', locationId: '1', quantity: 6, status: 'available', lastUpdated: new Date() },
      { id: '17', typeId: '17', locationId: '1', quantity: 5, status: 'available', lastUpdated: new Date() },
      
      // Extended Length Cables
      { id: '18', typeId: '18', locationId: '1', quantity: 12, status: 'available', lastUpdated: new Date() },
      { id: '19', typeId: '19', locationId: '1', quantity: 8, status: 'available', lastUpdated: new Date() },
      
      // Adapters and Connectors
      { id: '4', typeId: '9', locationId: '1', quantity: 25, status: 'available', lastUpdated: new Date() },
      { id: '21', typeId: '21', locationId: '1', quantity: 15, status: 'available', lastUpdated: new Date() },
      { id: '22', typeId: '22', locationId: '1', quantity: 20, status: 'available', lastUpdated: new Date() },
      
      // Power Equipment
      { id: '26', typeId: '26', locationId: '1', quantity: 30, status: 'available', lastUpdated: new Date() },
      
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
