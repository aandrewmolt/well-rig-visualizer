
import { useEffect, useMemo } from 'react';
import { IndividualEquipment, EquipmentType } from '@/types/inventory';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useDraftEquipmentManager } from '@/hooks/useDraftEquipmentManager';
import { useIndividualEquipmentForm } from './useIndividualEquipmentForm';
import { useIndividualEquipmentBulkCreate } from './useIndividualEquipmentBulkCreate';
import { useIndividualEquipmentOperations } from './useIndividualEquipmentOperations';

export const useIndividualEquipmentManager = (
  equipmentType: EquipmentType,
  onDraftCountChange?: (count: number) => void
) => {
  const { data, updateIndividualEquipment } = useInventoryData();

  const individualEquipment = useMemo(() => 
    data.individualEquipment.filter(eq => eq.typeId === equipmentType.id),
    [data.individualEquipment, equipmentType.id]
  );
  
  const {
    draftEquipment,
    hasUnsavedChanges,
    addDraftEquipment,
    addBulkDraftEquipment,
    saveImmediately,
    discardChanges,
    unsavedCount,
  } = useDraftEquipmentManager(individualEquipment, (equipment) => {
    updateIndividualEquipment(equipment);
    setTimeout(() => {
      console.log('Individual equipment saved, triggering sync check');
    }, 200);
  });

  useEffect(() => {
    if (onDraftCountChange) {
      onDraftCountChange(draftEquipment.length);
    }
  }, [draftEquipment.length, onDraftCountChange]);

  const allEquipment = useMemo(() => {
    return [
      ...individualEquipment,
      ...draftEquipment.map((draft, index) => ({
        ...draft,
        id: draft.id || `draft-${equipmentType.id}-${index}`,
        lastUpdated: draft.lastUpdated || new Date('2024-01-01'),
      } as IndividualEquipment))
    ];
  }, [individualEquipment, draftEquipment, equipmentType.id]);

  const formHook = useIndividualEquipmentForm(
    equipmentType,
    allEquipment,
    addDraftEquipment,
    updateIndividualEquipment,
    data.individualEquipment
  );

  const bulkCreateHook = useIndividualEquipmentBulkCreate(
    equipmentType,
    allEquipment,
    addBulkDraftEquipment
  );

  const operationsHook = useIndividualEquipmentOperations(
    individualEquipment,
    updateIndividualEquipment,
    data.storageLocations
  );

  return {
    // Data
    individualEquipment,
    draftEquipment,
    allEquipment,
    hasUnsavedChanges,
    unsavedCount,
    
    // Form management - properly expose all form hook properties
    isFormOpen: formHook.isDialogOpen,
    setIsFormOpen: formHook.setIsDialogOpen,
    editingEquipment: formHook.editingEquipment,
    setEditingEquipment: formHook.handleEdit,
    formData: formHook.formData,
    setFormData: formHook.setFormData,
    handleSubmit: formHook.handleSubmit,
    resetForm: formHook.resetForm,
    
    // Bulk creation
    ...bulkCreateHook,
    
    // Operations
    ...operationsHook,
    
    // Draft management
    saveImmediately,
    discardChanges,
  };
};
