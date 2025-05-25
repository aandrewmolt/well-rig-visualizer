
import { useMemo } from 'react';
import { EquipmentType, StorageLocation, EquipmentItem } from '@/types/inventory';

const EQUIPMENT_TYPES: EquipmentType[] = [
  { id: '1', name: '100ft Cable', category: 'cables', requiresIndividualTracking: false },
  { id: '2', name: '200ft Cable', category: 'cables', requiresIndividualTracking: false },
  { id: '3', name: '200ft Reel', category: 'cables', requiresIndividualTracking: false },
  { id: '4', name: '300ft Cable (New Version)', category: 'cables', requiresIndividualTracking: false },
  { id: '5', name: '300ft Cable (Old Version)', category: 'cables', requiresIndividualTracking: false },
  { id: '6', name: '300ft Reel', category: 'cables', requiresIndividualTracking: false },
  { id: '7', name: '1502 Pressure Gauge', category: 'gauges', requiresIndividualTracking: true, defaultIdPrefix: 'PG-' },
  { id: '8', name: 'Pencil Gauge', category: 'gauges', requiresIndividualTracking: true, defaultIdPrefix: 'PC-' },
  { id: '9', name: 'Y Adapter Cable', category: 'adapters', requiresIndividualTracking: false },
  { id: '10', name: 'Starlink', category: 'communication', requiresIndividualTracking: true, defaultIdPrefix: 'SL-' },
  { id: '11', name: 'Customer Computer', category: 'communication', requiresIndividualTracking: true, defaultIdPrefix: 'CC-' },
];

const STORAGE_LOCATIONS: StorageLocation[] = [
  { id: '1', name: 'Midland Office', isDefault: true },
  { id: '2', name: 'San Antonio Storage Unit', isDefault: false },
  { id: '3', name: 'Houston Office', isDefault: false },
  { id: '4', name: 'Calgary Office', isDefault: false },
];

export const useInventoryDefaults = () => {
  // Memoize the constants to prevent unnecessary re-renders
  const DEFAULT_EQUIPMENT_TYPES = useMemo(() => EQUIPMENT_TYPES, []);
  const DEFAULT_STORAGE_LOCATIONS = useMemo(() => STORAGE_LOCATIONS, []);

  const createDefaultInventory = useMemo(() => (): EquipmentItem[] => {
    return DEFAULT_EQUIPMENT_TYPES.map(type => ({
      id: `item-${type.id}`,
      typeId: type.id,
      locationId: '1', // Midland Office
      quantity: 25, // Increased default quantity for better availability
      status: 'available' as const,
      lastUpdated: new Date(),
    }));
  }, [DEFAULT_EQUIPMENT_TYPES]);

  const resetToDefaultInventory = useMemo(() => () => {
    return {
      equipmentTypes: DEFAULT_EQUIPMENT_TYPES,
      storageLocations: DEFAULT_STORAGE_LOCATIONS,
      equipmentItems: createDefaultInventory(),
      individualEquipment: [],
      lastSync: new Date(),
    };
  }, [DEFAULT_EQUIPMENT_TYPES, DEFAULT_STORAGE_LOCATIONS, createDefaultInventory]);

  return {
    DEFAULT_EQUIPMENT_TYPES,
    DEFAULT_STORAGE_LOCATIONS,
    createDefaultInventory,
    resetToDefaultInventory,
  };
};
