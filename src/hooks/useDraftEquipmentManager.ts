
import { useState, useCallback, useRef } from 'react';
import { IndividualEquipment } from '@/hooks/useInventoryData';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { toast } from '@/hooks/use-toast';

export interface DraftEquipment extends Omit<IndividualEquipment, 'id' | 'lastUpdated'> {
  id?: string;
  isNew?: boolean;
  isDirty?: boolean;
}

export const useDraftEquipmentManager = (
  originalEquipment: IndividualEquipment[],
  onSave: (equipment: IndividualEquipment[]) => void
) => {
  const [draftEquipment, setDraftEquipment] = useState<DraftEquipment[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const originalDataRef = useRef(originalEquipment);

  // Update original data reference when prop changes
  if (originalDataRef.current !== originalEquipment) {
    originalDataRef.current = originalEquipment;
    if (draftEquipment.length === 0) {
      setDraftEquipment([]);
    }
  }

  const saveChanges = useCallback(() => {
    if (!hasUnsavedChanges) return;

    const finalEquipment: IndividualEquipment[] = [
      ...originalDataRef.current,
      ...draftEquipment.map(draft => ({
        ...draft,
        id: draft.id || `${Date.now()}-${Math.random()}`,
        lastUpdated: new Date(),
      } as IndividualEquipment))
    ];

    onSave(finalEquipment);
    setDraftEquipment([]);
    setHasUnsavedChanges(false);
    toast({
      title: "Changes saved",
      description: `Successfully saved ${draftEquipment.length} equipment items`,
    });
  }, [draftEquipment, hasUnsavedChanges, onSave]);

  const debouncedSave = useDebouncedSave(saveChanges, 3000);

  const addDraftEquipment = useCallback((equipment: DraftEquipment) => {
    setDraftEquipment(prev => [...prev, { ...equipment, isNew: true, isDirty: true }]);
    setHasUnsavedChanges(true);
    debouncedSave();
  }, [debouncedSave]);

  const updateDraftEquipment = useCallback((id: string, updates: Partial<DraftEquipment>) => {
    setDraftEquipment(prev => prev.map(eq => 
      eq.id === id ? { ...eq, ...updates, isDirty: true } : eq
    ));
    setHasUnsavedChanges(true);
    debouncedSave();
  }, [debouncedSave]);

  const removeDraftEquipment = useCallback((id: string) => {
    setDraftEquipment(prev => prev.filter(eq => eq.id !== id));
    setHasUnsavedChanges(draftEquipment.length > 1);
  }, [draftEquipment.length]);

  const discardChanges = useCallback(() => {
    setDraftEquipment([]);
    setHasUnsavedChanges(false);
    toast({
      title: "Changes discarded",
      description: "All unsaved changes have been discarded",
    });
  }, []);

  const addBulkDraftEquipment = useCallback((equipmentList: DraftEquipment[]) => {
    setDraftEquipment(prev => [...prev, ...equipmentList.map(eq => ({ ...eq, isNew: true, isDirty: true }))]);
    setHasUnsavedChanges(true);
    debouncedSave();
  }, [debouncedSave]);

  return {
    draftEquipment,
    hasUnsavedChanges,
    addDraftEquipment,
    updateDraftEquipment,
    removeDraftEquipment,
    addBulkDraftEquipment,
    saveChanges,
    discardChanges,
    unsavedCount: draftEquipment.length,
  };
};
