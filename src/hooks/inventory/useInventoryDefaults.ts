
import { EquipmentType, StorageLocation, EquipmentItem } from '@/types/inventory';

export const useInventoryDefaults = () => {
  // Equipment types that match the application's expectations
  const DEFAULT_EQUIPMENT_TYPES: EquipmentType[] = [
    // Communication Equipment (SS, SL, CC)
    {
      id: 'ss-box-type',
      name: 'ShearStream Box',
      category: 'communication',
      description: 'Main data acquisition box',
      requiresIndividualTracking: true,
      defaultIdPrefix: 'SS'
    },
    {
      id: 'starlink-type',
      name: 'Starlink Satellite',
      category: 'communication', 
      description: 'Satellite communication device',
      requiresIndividualTracking: true,
      defaultIdPrefix: 'SL'
    },
    {
      id: 'customer-computer-type',
      name: 'Customer Computer',
      category: 'communication',
      description: 'Customer provided computer system',
      requiresIndividualTracking: true,
      defaultIdPrefix: 'CC'
    },
    
    // Cable Types
    {
      id: 'cable-100ft-type',
      name: '100ft Pressure Cable',
      category: 'cables',
      description: '100 foot pressure monitoring cable',
      requiresIndividualTracking: false,
      defaultIdPrefix: 'C100'
    },
    {
      id: 'cable-200ft-type', 
      name: '200ft Pressure Cable',
      category: 'cables',
      description: '200 foot pressure monitoring cable',
      requiresIndividualTracking: false,
      defaultIdPrefix: 'C200'
    },
    {
      id: 'cable-300ft-old-type',
      name: '300ft Pressure Cable (Old - Y adapter only)',
      category: 'cables',
      description: '300 foot cable requiring Y adapter connection',
      requiresIndividualTracking: false,
      defaultIdPrefix: 'C300O'
    },
    {
      id: 'cable-300ft-new-type',
      name: '300ft Pressure Cable (New - Direct to wells)',
      category: 'cables',
      description: '300 foot cable with direct well connection',
      requiresIndividualTracking: false,
      defaultIdPrefix: 'C300N'
    },
    
    // Gauges and Adapters
    {
      id: 'pressure-gauge-type',
      name: 'Pressure Gauge',
      category: 'gauges',
      description: 'Downhole pressure monitoring gauge',
      requiresIndividualTracking: false,
      defaultIdPrefix: 'PG'
    },
    {
      id: 'y-adapter-type',
      name: 'Y Adapter',
      category: 'adapters',
      description: 'Cable splitting adapter',
      requiresIndividualTracking: false,
      defaultIdPrefix: 'YA'
    },
    
    // Power Equipment
    {
      id: 'power-supply-type',
      name: 'Power Supply Unit',
      category: 'power',
      description: 'Main power supply for equipment',
      requiresIndividualTracking: false,
      defaultIdPrefix: 'PS'
    }
  ];

  const DEFAULT_STORAGE_LOCATIONS: StorageLocation[] = [
    {
      id: 'main-warehouse',
      name: 'Main Warehouse',
      address: '123 Industrial Blvd, Houston, TX',
      isDefault: true
    },
    {
      id: 'field-office-midland',
      name: 'Field Office - Midland',
      address: 'Midland, TX',
      isDefault: false
    },
    {
      id: 'mobile-unit-1',
      name: 'Mobile Unit #1',
      address: 'Field Deployment',
      isDefault: false
    }
  ];

  const createDefaultInventory = (): EquipmentItem[] => {
    const defaultLocation = DEFAULT_STORAGE_LOCATIONS.find(loc => loc.isDefault)?.id || 'main-warehouse';
    
    return [
      // Communication Equipment Stock
      {
        id: 'ss-stock-1',
        typeId: 'ss-box-type',
        locationId: defaultLocation,
        quantity: 5,
        status: 'available',
        lastUpdated: new Date()
      },
      {
        id: 'sl-stock-1',
        typeId: 'starlink-type', 
        locationId: defaultLocation,
        quantity: 3,
        status: 'available',
        lastUpdated: new Date()
      },
      {
        id: 'cc-stock-1',
        typeId: 'customer-computer-type',
        locationId: defaultLocation,
        quantity: 8,
        status: 'available',
        lastUpdated: new Date()
      },
      
      // Cable Stock
      {
        id: 'cable-100-stock',
        typeId: 'cable-100ft-type',
        locationId: defaultLocation,
        quantity: 25,
        status: 'available',
        lastUpdated: new Date()
      },
      {
        id: 'cable-200-stock',
        typeId: 'cable-200ft-type',
        locationId: defaultLocation,
        quantity: 20,
        status: 'available',
        lastUpdated: new Date()
      },
      {
        id: 'cable-300-old-stock',
        typeId: 'cable-300ft-old-type',
        locationId: defaultLocation,
        quantity: 15,
        status: 'available',
        lastUpdated: new Date()
      },
      {
        id: 'cable-300-new-stock',
        typeId: 'cable-300ft-new-type',
        locationId: defaultLocation,
        quantity: 10,
        status: 'available',
        lastUpdated: new Date()
      },
      
      // Gauges and Adapters
      {
        id: 'gauge-stock',
        typeId: 'pressure-gauge-type',
        locationId: defaultLocation,
        quantity: 50,
        status: 'available',
        lastUpdated: new Date()
      },
      {
        id: 'adapter-stock',
        typeId: 'y-adapter-type',
        locationId: defaultLocation,
        quantity: 30,
        status: 'available',
        lastUpdated: new Date()
      },
      
      // Power Equipment
      {
        id: 'power-stock',
        typeId: 'power-supply-type',
        locationId: defaultLocation,
        quantity: 12,
        status: 'available',
        lastUpdated: new Date()
      }
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
