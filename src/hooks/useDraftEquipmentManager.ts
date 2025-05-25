
import { useState, useCallback, useMemo } from 'react';
import { IndividualEquipment } from '@/hooks/useInventoryData';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { toast } from '@/hooks/use-toast';

export interface DraftEquipment extends Omit<IndividualEquipment, 'id' | 'lastUpdated'> {
  id?: string;
  isNew?: boolean;
  isDirty?: boolean;
  lastUpdated?: Date;
}

export const useDraftEquipmentManager = (
  originalEquipment: IndividualEquipment[],
  onSave: (equipment: IndividualEquipment[]) => void
) => {
  const [draftEquipment, setDraftEquipment] = useState<DraftEquipment[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Use a stable reference with useMemo to prevent re-renders
  const originalDataStable = useMemo(() => originalEquipment, [originalEquipment.length]);

  const saveChanges = useCallback(() => {
    if (!hasUnsavedChanges || draftEquipment.length === 0) return;

    const finalEquipment: IndividualEquipment[] = [
      ...originalDataStable,
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
  }, [draftEquipment, hasUnsavedChanges, onSave, originalDataStable]);

  // Destructure the debounced save properly
  const { debouncedSave, cleanup } = useDebouncedSave(saveChanges, 500);

  const saveImmediately = useCallback(() => {
    saveChanges();
  }, [saveChanges]);

  const addDraftEquipment = useCallback((equipment: DraftEquipment, immediate = false) => {
    setDraftEquipment(prev => [...prev, { ...equipment, isNew: true, isDirty: true }]);
    setHasUnsavedChanges(true);
    if (immediate) {
      // Use setTimeout to ensure state is updated before save
      setTimeout(() => saveImmediately(), 0);
    } else {
      debouncedSave();
    }
  }, [debouncedSave, saveImmediately]);

  const updateDraftEquipment = useCallback((id: string, updates: Partial<DraftEquipment>) => {
    setDraftEquipment(prev => prev.map(eq => 
      eq.id === id ? { ...eq, ...updates, isDirty: true } : eq
    ));
    setHasUnsavedChanges(true);
    debouncedSave();
  }, [debouncedSave]);

  const removeDraftEquipment = useCallback((id: string) => {
    setDraftEquipment(prev => {
      const newDrafts = prev.filter(eq => eq.id !== id);
      setHasUnsavedChanges(newDrafts.length > 0);
      return newDrafts;
    });
  }, []);

  const discardChanges = useCallback(() => {
    setDraftEquipment([]);
    setHasUnsavedChanges(false);
    toast({
      title: "Changes discarded",
      description: "All unsaved changes have been discarded",
    });
  }, []);

  const addBulkDraftEquipment = useCallback((equipmentList: DraftEquipment[], immediate = false) => {
    setDraftEquipment(prev => [...prev, ...equipmentList.map(eq => ({ ...eq, isNew: true, isDirty: true }))]);
    setHasUnsavedChanges(true);
    if (immediate) {
      // Use setTimeout to ensure state is updated before save
      setTimeout(() => saveImmediately(), 0);
    } else {
      debouncedSave();
    }
  }, [debouncedSave, saveImmediately]);

  return {
    draftEquipment,
    hasUnsavedChanges,
    addDraftEquipment,
    updateDraftEquipment,
    removeDraftEquipment,
    addBulkDraftEquipment,
    saveChanges,
    saveImmediately,
    discardChanges,
    unsavedCount: draftEquipment.length,
  };
};
