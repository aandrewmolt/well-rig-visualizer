
import { EquipmentType, StorageLocation, EquipmentItem } from '@/types/inventory';

export const useInventoryDefaults = () => {
  // Updated equipment types with separate 300ft cable variants
  const DEFAULT_EQUIPMENT_TYPES: EquipmentType[] = [
    // Cables
    {
      id: '1',
      name: '100ft Cable',
      category: 'cables',
      requiresIndividualTracking: false,
      description: '100 foot cable reel'
    },
    {
      id: '2',
      name: '200ft Cable',
      category: 'cables',
      requiresIndividualTracking: false,
      description: '200 foot cable reel'
    },
    {
      id: '3',
      name: '300ft Cable (Old)',
      category: 'cables',
      requiresIndividualTracking: false,
      description: '300 foot cable reel - older version'
    },
    {
      id: '4',
      name: '300ft Cable (New)',
      category: 'cables',
      requiresIndividualTracking: false,
      description: '300 foot cable reel - newer version'
    },
    
    // Gauges
    {
      id: '7',
      name: '1502 Pressure Gauge',
      category: 'gauges',
      requiresIndividualTracking: true,
      defaultIdPrefix: 'PG-',
      description: 'Precision pressure measurement gauge'
    },
    
    // Adapters
    {
      id: '9',
      name: 'Y Adapter Cable',
      category: 'adapters',
      requiresIndividualTracking: false,
      description: 'Y-shaped adapter cable for connections'
    },
    
    // Communication Equipment
    {
      id: '10',
      name: 'Starlink',
      category: 'communication',
      requiresIndividualTracking: true,
      defaultIdPrefix: 'SL-',
      description: 'Satellite internet communication device'
    },
    {
      id: '11',
      name: 'Customer Computer',
      category: 'communication',
      requiresIndividualTracking: true,
      defaultIdPrefix: 'CC-',
      description: 'Customer-provided computer equipment'
    },
    
    // Power Equipment
    {
      id: '12',
      name: 'Power Supply Unit',
      category: 'power',
      requiresIndividualTracking: false,
      description: 'Electrical power supply unit'
    },
    {
      id: '13',
      name: 'Battery Pack',
      category: 'power',
      requiresIndividualTracking: true,
      defaultIdPrefix: 'BP-',
      description: 'Rechargeable battery pack'
    }
  ];

  const DEFAULT_STORAGE_LOCATIONS: StorageLocation[] = [
    {
      id: '101',
      name: 'Main Storage',
      address: '123 Highland Rd, Storage Unit A',
      isDefault: true,
    },
    {
      id: '102',
      name: 'Mobile Van',
      address: 'In Transit',
      isDefault: false,
    },
    {
      id: '103',
      name: 'Red Tag Area',
      address: 'Quarantine Zone',
      isDefault: false,
    },
  ];

  const createDefaultInventory = (): EquipmentItem[] => {
    const defaultLocationId = DEFAULT_STORAGE_LOCATIONS[0].id;
    
    return [
      // Updated cable inventory with separate 300ft variants
      {
        id: 'item-1',
        typeId: '1', // 100ft Cable
        locationId: defaultLocationId,
        quantity: 8,
        status: 'available',
        notes: '100ft cable reels in good condition',
        lastUpdated: new Date()
      },
      {
        id: 'item-2',
        typeId: '2', // 200ft Cable
        locationId: defaultLocationId,
        quantity: 6,
        status: 'available',
        notes: '200ft cable reels',
        lastUpdated: new Date()
      },
      {
        id: 'item-3',
        typeId: '3', // 300ft Cable (Old)
        locationId: defaultLocationId,
        quantity: 3,
        status: 'available',
        notes: '300ft cable reels - older version',
        lastUpdated: new Date()
      },
      {
        id: 'item-4',
        typeId: '4', // 300ft Cable (New)
        locationId: defaultLocationId,
        quantity: 5,
        status: 'available',
        notes: '300ft cable reels - newer improved version',
        lastUpdated: new Date()
      },
      {
        id: 'item-5',
        typeId: '9', // Y Adapter Cable
        locationId: defaultLocationId,
        quantity: 12,
        status: 'available',
        notes: 'Y adapter cables for connections',
        lastUpdated: new Date()
      },
      {
        id: 'item-6',
        typeId: '12', // Power Supply Unit
        locationId: defaultLocationId,
        quantity: 4,
        status: 'available',
        notes: 'Power supply units',
        lastUpdated: new Date()
      }
    ];
  };

  const resetToDefaultInventory = (): any => {
    return {
      equipmentTypes: DEFAULT_EQUIPMENT_TYPES,
      storageLocations: DEFAULT_STORAGE_LOCATIONS,
      equipmentItems: createDefaultInventory(),
      individualEquipment: [],
      lastSync: new Date(),
    };
  };

  return {
    DEFAULT_EQUIPMENT_TYPES,
    DEFAULT_STORAGE_LOCATIONS,
    createDefaultInventory,
    resetToDefaultInventory,
  };
};
