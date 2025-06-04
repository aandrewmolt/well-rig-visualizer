
import { EquipmentType, StorageLocation, EquipmentItem } from '@/types/inventory';

export const DEFAULT_EQUIPMENT_TYPES: EquipmentType[] = [
  // Communication Equipment
  { id: 'shearstream-box', name: 'ShearStream Box', category: 'Communication', description: 'Main data acquisition unit' },
  { id: 'starlink', name: 'Starlink', category: 'Communication', description: 'Satellite internet terminal' },
  { id: 'customer-computer', name: 'Customer Computer', category: 'Communication', description: 'Client workstation' },
  { id: 'customer-tablet', name: 'Customer Tablet', category: 'Communication', description: 'Portable client device' },
  
  // Cables - Updated to include 100ft and 200ft
  { id: '100ft-cable', name: '100ft Cable', category: 'Cables', description: '100 foot data cable' },
  { id: '200ft-cable', name: '200ft Cable', category: 'Cables', description: '200 foot data cable' },
  { id: '300ft-cable', name: '300ft Cable', category: 'Cables', description: '300 foot data cable' },
  
  // Adapters
  { id: 'y-adapter', name: 'Y Adapter', category: 'Adapters', description: 'Signal splitting adapter' },
  
  // Gauges
  { id: 'wellside-gauge', name: 'Wellside Gauge', category: 'Gauges', description: 'Pressure monitoring device' },
];

export const DEFAULT_STORAGE_LOCATIONS: StorageLocation[] = [
  { id: 'warehouse', name: 'Main Warehouse', description: 'Primary storage facility' },
  { id: 'field-trailer', name: 'Field Trailer', description: 'Mobile field storage' },
  { id: 'deployed', name: 'Deployed', description: 'Equipment currently in use on jobs' },
  { id: 'maintenance', name: 'Maintenance', description: 'Equipment under repair or maintenance' },
];

export const useInventoryDefaults = () => {
  const createDefaultInventory = (): EquipmentItem[] => [
    // ShearStream Boxes
    { id: 'ss001', typeId: 'shearstream-box', locationId: 'warehouse', quantity: 3, status: 'available' },
    { id: 'ss002', typeId: 'shearstream-box', locationId: 'field-trailer', quantity: 2, status: 'available' },
    
    // Starlink units
    { id: 'sl001', typeId: 'starlink', locationId: 'warehouse', quantity: 4, status: 'available' },
    { id: 'sl002', typeId: 'starlink', locationId: 'field-trailer', quantity: 1, status: 'available' },
    
    // Customer Computers
    { id: 'cc001', typeId: 'customer-computer', locationId: 'warehouse', quantity: 6, status: 'available' },
    { id: 'cc002', typeId: 'customer-computer', locationId: 'field-trailer', quantity: 2, status: 'available' },
    
    // Customer Tablets
    { id: 'ct001', typeId: 'customer-tablet', locationId: 'warehouse', quantity: 4, status: 'available' },
    
    // Cables - Enhanced with 100ft and 200ft
    { id: 'c100-001', typeId: '100ft-cable', locationId: 'warehouse', quantity: 15, status: 'available' },
    { id: 'c100-002', typeId: '100ft-cable', locationId: 'field-trailer', quantity: 8, status: 'available' },
    { id: 'c200-001', typeId: '200ft-cable', locationId: 'warehouse', quantity: 12, status: 'available' },
    { id: 'c200-002', typeId: '200ft-cable', locationId: 'field-trailer', quantity: 6, status: 'available' },
    { id: 'c300-001', typeId: '300ft-cable', locationId: 'warehouse', quantity: 8, status: 'available' },
    { id: 'c300-002', typeId: '300ft-cable', locationId: 'field-trailer', quantity: 4, status: 'available' },
    
    // Y Adapters
    { id: 'ya001', typeId: 'y-adapter', locationId: 'warehouse', quantity: 10, status: 'available' },
    { id: 'ya002', typeId: 'y-adapter', locationId: 'field-trailer', quantity: 5, status: 'available' },
    
    // Wellside Gauges
    { id: 'wg001', typeId: 'wellside-gauge', locationId: 'warehouse', quantity: 3, status: 'available' },
    { id: 'wg002', typeId: 'wellside-gauge', locationId: 'field-trailer', quantity: 1, status: 'available' },
  ];

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
