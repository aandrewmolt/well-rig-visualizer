
import { TrackedEquipment } from '@/types/equipment';
import { useInventoryData } from '@/hooks/useInventoryData';

export const useTrackedEquipmentTypes = () => {
  const { data: inventoryData } = useInventoryData();

  // Map individual equipment types to tracked equipment types
  const mapToTrackedType = (typeId: string): TrackedEquipment['type'] | null => {
    const equipmentType = inventoryData.equipmentTypes.find(type => type.id === typeId);
    if (!equipmentType) return null;
    
    const typeName = equipmentType.name.toLowerCase();
    if (typeName.includes('shearstream') || typeName.includes('ss') || equipmentType.id === '12') return 'shearstream-box';
    if (typeName.includes('starlink') || typeName.includes('sl') || equipmentType.id === '10') return 'starlink';
    if (typeName.includes('computer') || typeName.includes('cc') || equipmentType.id === '11') return 'customer-computer';
    
    return null;
  };

  const createDefaultEquipment = (): TrackedEquipment[] => [
    {
      id: 'ss-001',
      equipmentId: 'SS-001',
      type: 'shearstream-box',
      name: 'ShearStream Box #1',
      status: 'available',
      lastUpdated: new Date(),
    },
    {
      id: 'sl-001',
      equipmentId: 'SL-001',
      type: 'starlink',
      name: 'Starlink #1',
      status: 'available',
      lastUpdated: new Date(),
    },
    {
      id: 'cc-001',
      equipmentId: 'CC-001',
      type: 'customer-computer',
      name: 'Customer Computer #1',
      status: 'available',
      lastUpdated: new Date(),
    },
    {
      id: 'cc-002',
      equipmentId: 'CC-002',
      type: 'customer-computer',
      name: 'Customer Computer #2',
      status: 'available',
      lastUpdated: new Date(),
    },
  ];

  return {
    mapToTrackedType,
    createDefaultEquipment,
  };
};
