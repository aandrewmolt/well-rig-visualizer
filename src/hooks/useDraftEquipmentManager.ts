
import { useState, useCallback } from 'react';
import { IndividualEquipment } from '@/types/inventory';

export const useDraftEquipmentManager = (
  existingEquipment: IndividualEquipment[],
  onSave: (equipment: IndividualEquipment[]) => void
) => {
  const [draftEquipment, setDraftEquipment] = useState<any[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const addDraftEquipment = useCallback((equipment: any) => {
    const newDraft = { ...equipment, id: `draft-${Date.now()}` };
    setDraftEquipment(prev => [...prev, newDraft]);
    setHasUnsavedChanges(true);

    // Auto-save after 500ms
    setTimeout(() => {
      const finalEquipment = { ...newDraft, id: `saved-${Date.now()}`, lastUpdated: new Date() };
      const updatedEquipment = [...existingEquipment, finalEquipment];
      onSave(updatedEquipment);
      setDraftEquipment(prev => prev.filter(draft => draft.equipmentId !== equipment.equipmentId));
      setHasUnsavedChanges(false);
    }, 500);
  }, [existingEquipment, onSave]);

  const addBulkDraftEquipment = useCallback((equipment: any[]) => {
    const newDrafts = equipment.map((eq, index) => ({ ...eq, id: `draft-bulk-${Date.now()}-${index}` }));
    setDraftEquipment(prev => [...prev, ...newDrafts]);
    setHasUnsavedChanges(true);

    // Auto-save after 500ms
    setTimeout(() => {
      const finalEquipment = equipment.map((eq, index) => ({ 
        ...eq, 
        id: `saved-bulk-${Date.now()}-${index}`, 
        lastUpdated: new Date() 
      }));
      const updatedEquipment = [...existingEquipment, ...finalEquipment];
      onSave(updatedEquipment);
      setDraftEquipment(prev => prev.filter(draft => !equipment.some(eq => eq.equipmentId === draft.equipmentId)));
      setHasUnsavedChanges(false);
    }, 500);
  }, [existingEquipment, onSave]);

  const saveImmediately = useCallback(() => {
    if (draftEquipment.length === 0) return;

    const finalEquipment = draftEquipment.map((draft, index) => ({ 
      ...draft, 
      id: `immediate-${Date.now()}-${index}`, 
      lastUpdated: new Date() 
    }));
    const updatedEquipment = [...existingEquipment, ...finalEquipment];
    onSave(updatedEquipment);
    setDraftEquipment([]);
    setHasUnsavedChanges(false);
  }, [draftEquipment, existingEquipment, onSave]);

  const discardChanges = useCallback(() => {
    setDraftEquipment([]);
    setHasUnsavedChanges(false);
  }, []);

  return {
    draftEquipment,
    hasUnsavedChanges,
    unsavedCount: draftEquipment.length,
    addDraftEquipment,
    addBulkDraftEquipment,
    saveImmediately,
    discardChanges,
  };
};
