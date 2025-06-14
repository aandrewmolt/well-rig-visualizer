
import { useState, useCallback } from 'react';
import { EquipmentType } from '@/types/inventory';
import { toast } from 'sonner';
import { useEquipmentIdGenerator } from './useEquipmentIdGenerator';

export const useIndividualEquipmentBulkCreate = (
  equipmentType: EquipmentType,
  allEquipment: any[],
  onAddBulkDraft: (equipment: any[]) => void
) => {
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false);
  const { generateEquipmentId, generateEquipmentName } = useEquipmentIdGenerator();
  
  const [bulkCreateData, setBulkCreateData] = useState({
    count: 5,
    prefix: equipmentType.defaultIdPrefix || '',
    startNumber: 1,
    locationId: '',
    selectedPrefix: equipmentType.name === 'Customer Computer' ? 'CC' : 
                   equipmentType.name === 'Customer Tablet' ? 'CT' : 
                   equipmentType.defaultIdPrefix || ''
  });

  const handleBulkCreate = useCallback(async (saveImmediate = false) => {
    if (!bulkCreateData.locationId || bulkCreateData.count <= 0) {
      toast.error('Location and valid count are required');
      return;
    }

    const currentPrefix = equipmentType.name === 'Company Computer' 
      ? (bulkCreateData.selectedPrefix || 'CC')
      : equipmentType.defaultIdPrefix || '';

    const newEquipment = [];
    const existingIds = allEquipment.map(eq => eq.equipmentId);

    for (let i = 0; i < bulkCreateData.count; i++) {
      const number = bulkCreateData.startNumber + i;
      const equipmentId = generateEquipmentId({ defaultIdPrefix: currentPrefix } as EquipmentType, number);
      
      if (existingIds.includes(equipmentId)) {
        toast.error(`Equipment ID ${equipmentId} already exists`);
        return;
      }

      const equipmentName = generateEquipmentName({ ...equipmentType, defaultIdPrefix: currentPrefix }, equipmentId);

      newEquipment.push({
        equipmentId,
        name: equipmentName,
        typeId: equipmentType.id,
        locationId: bulkCreateData.locationId,
        status: 'available' as const,
      });
    }

    try {
      onAddBulkDraft(newEquipment);
      toast.success(`${bulkCreateData.count} equipment items added to drafts`);
      
      setIsBulkCreateOpen(false);
      setBulkCreateData(prev => ({
        ...prev,
        startNumber: prev.startNumber + prev.count,
        count: 5
      }));
    } catch (error) {
      console.error('Error creating bulk equipment:', error);
      toast.error('Failed to create bulk equipment');
    }
  }, [bulkCreateData, equipmentType, allEquipment, generateEquipmentId, generateEquipmentName, onAddBulkDraft]);

  return {
    isBulkCreateOpen,
    setIsBulkCreateOpen,
    bulkCreateData,
    setBulkCreateData,
    handleBulkCreate,
  };
};
