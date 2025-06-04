
import { EquipmentType, StorageLocation, EquipmentItem } from '@/types/inventory';

export const DEFAULT_EQUIPMENT_TYPES: EquipmentType[] = [
  // Communication Equipment
  { id: 'shearstream-box', name: 'ShearStream Box', category: 'communication', description: 'Main data acquisition unit', requiresIndividualTracking: false },
  { id: 'starlink', name: 'Starlink', category: 'communication', description: 'Satellite internet terminal', requiresIndividualTracking: false },
  { id: 'customer-computer', name: 'Customer Computer', category: 'communication', description: 'Client workstation', requiresIndividualTracking: false },
  { id: 'customer-tablet', name: 'Customer Tablet', category: 'communication', description: 'Portable client device', requiresIndividualTracking: false },
  
  // Cables - Only specific 300ft variants, no generic 300ft
  { id: '100ft-cable', name: '100ft Cable', category: 'cables', description: '100 foot data cable', requiresIndividualTracking: false },
  { id: '200ft-cable', name: '200ft Cable', category: 'cables', description: '200 foot data cable', requiresIndividualTracking: false },
  { id: '300ft-cable-old', name: '300ft Cable/Reel (Old)', category: 'cables', description: '300 foot data cable for Y-adapter connections', requiresIndividualTracking: false },
  { id: '300ft-cable-new', name: '300ft Cable/Reel (New)', category: 'cables', description: '300 foot data cable for direct connections', requiresIndividualTracking: false },
  
  // Adapters
  { id: 'y-adapter', name: 'Y Adapter', category: 'adapters', description: 'Signal splitting adapter', requiresIndividualTracking: false },
  
  // Gauges
  { id: 'wellside-gauge', name: 'Wellside Gauge', category: 'gauges', description: 'Pressure monitoring device', requiresIndividualTracking: false },
];

export const DEFAULT_STORAGE_LOCATIONS: StorageLocation[] = [
  { id: 'warehouse', name: 'Main Warehouse', isDefault: true },
  { id: 'field-trailer', name: 'Field Trailer', isDefault: false },
  { id: 'deployed', name: 'Deployed', isDefault: false },
  { id: 'maintenance', name: 'Maintenance', isDefault: false },
];

export const useInventoryDefaults = () => {
  const createDefaultInventory = (): EquipmentItem[] => [
    // ShearStream Boxes
    { id: 'ss001', typeId: 'shearstream-box', locationId: 'warehouse', quantity: 3, status: 'available', lastUpdated: new Date() },
    { id: 'ss002', typeId: 'shearstream-box', locationId: 'field-trailer', quantity: 2, status: 'available', lastUpdated: new Date() },
    
    // Starlink units
    { id: 'sl001', typeId: 'starlink', locationId: 'warehouse', quantity: 4, status: 'available', lastUpdated: new Date() },
    { id: 'sl002', typeId: 'starlink', locationId: 'field-trailer', quantity: 1, status: 'available', lastUpdated: new Date() },
    
    // Customer Computers
    { id: 'cc001', typeId: 'customer-computer', locationId: 'warehouse', quantity: 6, status: 'available', lastUpdated: new Date() },
    { id: 'cc002', typeId: 'customer-computer', locationId: 'field-trailer', quantity: 2, status: 'available', lastUpdated: new Date() },
    
    // Customer Tablets
    { id: 'ct001', typeId: 'customer-tablet', locationId: 'warehouse', quantity: 4, status: 'available', lastUpdated: new Date() },
    
    // Cables - Removed generic 300ft cable, kept only specific Old and New variants
    { id: 'c100-001', typeId: '100ft-cable', locationId: 'warehouse', quantity: 15, status: 'available', lastUpdated: new Date() },
    { id: 'c100-002', typeId: '100ft-cable', locationId: 'field-trailer', quantity: 8, status: 'available', lastUpdated: new Date() },
    { id: 'c200-001', typeId: '200ft-cable', locationId: 'warehouse', quantity: 12, status: 'available', lastUpdated: new Date() },
    { id: 'c200-002', typeId: '200ft-cable', locationId: 'field-trailer', quantity: 6, status: 'available', lastUpdated: new Date() },
    { id: 'c300old-001', typeId: '300ft-cable-old', locationId: 'warehouse', quantity: 6, status: 'available', lastUpdated: new Date() },
    { id: 'c300old-002', typeId: '300ft-cable-old', locationId: 'field-trailer', quantity: 3, status: 'available', lastUpdated: new Date() },
    { id: 'c300new-001', typeId: '300ft-cable-new', locationId: 'warehouse', quantity: 5, status: 'available', lastUpdated: new Date() },
    { id: 'c300new-002', typeId: '300ft-cable-new', locationId: 'field-trailer', quantity: 2, status: 'available', lastUpdated: new Date() },
    
    // Y Adapters
    { id: 'ya001', typeId: 'y-adapter', locationId: 'warehouse', quantity: 10, status: 'available', lastUpdated: new Date() },
    { id: 'ya002', typeId: 'y-adapter', locationId: 'field-trailer', quantity: 5, status: 'available', lastUpdated: new Date() },
    
    // Wellside Gauges
    { id: 'wg001', typeId: 'wellside-gauge', locationId: 'warehouse', quantity: 3, status: 'available', lastUpdated: new Date() },
    { id: 'wg002', typeId: 'wellside-gauge', locationId: 'field-trailer', quantity: 1, status: 'available', lastUpdated: new Date() },
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
