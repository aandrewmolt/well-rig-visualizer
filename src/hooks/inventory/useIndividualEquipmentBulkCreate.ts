
import { useState, useCallback } from 'react';
import { EquipmentType, IndividualEquipment } from '@/types/inventory';
import { BulkCreateData } from './types/individualEquipmentTypes';
import { toast } from '@/hooks/use-toast';
import { DraftEquipment } from '@/hooks/useDraftEquipmentManager';
import { useEquipmentIdGenerator } from './useEquipmentIdGenerator';

export const useIndividualEquipmentBulkCreate = (
  equipmentType: EquipmentType,
  allEquipment: IndividualEquipment[],
  addBulkDraftEquipment: (equipment: DraftEquipment[], saveImmediate?: boolean) => void
) => {
  const { generateEquipmentId, generateEquipmentName } = useEquipmentIdGenerator();
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false);
  const [bulkCreateData, setBulkCreateData] = useState<BulkCreateData>({
    count: 5,
    prefix: equipmentType.defaultIdPrefix || '',
    startNumber: 1,
    locationId: ''
  });

  const handleBulkCreate = useCallback((saveImmediate = false) => {
    if (!bulkCreateData.locationId || bulkCreateData.count <= 0) {
      toast({
        title: "Validation Error",
        description: "Location and valid count are required",
        variant: "destructive",
      });
      return;
    }

    const newEquipment: DraftEquipment[] = [];
    const existingIds = allEquipment.map(eq => eq.equipmentId);

    for (let i = 0; i < bulkCreateData.count; i++) {
      const number = bulkCreateData.startNumber + i;
      const equipmentId = generateEquipmentId(equipmentType, number);
      
      if (existingIds.includes(equipmentId)) {
        toast({
          title: "Duplicate ID",
          description: `Equipment ID ${equipmentId} already exists`,
          variant: "destructive",
        });
        return;
      }

      // Use the new name generation function
      const equipmentName = generateEquipmentName(equipmentType, equipmentId);

      newEquipment.push({
        equipmentId,
        name: equipmentName,
        typeId: equipmentType.id,
        locationId: bulkCreateData.locationId,
        status: 'available',
      });
    }

    addBulkDraftEquipment(newEquipment, saveImmediate);
    toast({
      title: "Bulk Creation",
      description: saveImmediate 
        ? `${bulkCreateData.count} equipment items saved successfully`
        : `${bulkCreateData.count} equipment items added to drafts (will auto-save in 0.5 seconds)`,
    });
    setIsBulkCreateOpen(false);
    setBulkCreateData({
      count: 5,
      prefix: equipmentType.defaultIdPrefix || '',
      startNumber: bulkCreateData.startNumber + bulkCreateData.count,
      locationId: ''
    });
  }, [bulkCreateData, allEquipment, equipmentType, addBulkDraftEquipment, generateEquipmentId, generateEquipmentName]);

  return {
    isBulkCreateOpen,
    setIsBulkCreateOpen,
    bulkCreateData,
    setBulkCreateData,
    handleBulkCreate,
  };
};
