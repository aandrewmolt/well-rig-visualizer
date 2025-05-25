
import { useState, useCallback, useRef, useMemo } from 'react';
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
    console.log('Saving changes, hasUnsavedChanges:', hasUnsavedChanges);
    if (!hasUnsavedChanges) return;

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

  const debouncedSave = useDebouncedSave(saveChanges, 3000);

  const addDraftEquipment = useCallback((equipment: DraftEquipment) => {
    console.log('Adding draft equipment:', equipment);
    setDraftEquipment(prev => [...prev, { ...equipment, isNew: true, isDirty: true }]);
    setHasUnsavedChanges(true);
    debouncedSave();
  }, [debouncedSave]);

  const updateDraftEquipment = useCallback((id: string, updates: Partial<DraftEquipment>) => {
    console.log('Updating draft equipment:', id, updates);
    setDraftEquipment(prev => prev.map(eq => 
      eq.id === id ? { ...eq, ...updates, isDirty: true } : eq
    ));
    setHasUnsavedChanges(true);
    debouncedSave();
  }, [debouncedSave]);

  const removeDraftEquipment = useCallback((id: string) => {
    console.log('Removing draft equipment:', id);
    setDraftEquipment(prev => {
      const newDrafts = prev.filter(eq => eq.id !== id);
      setHasUnsavedChanges(newDrafts.length > 0);
      return newDrafts;
    });
  }, []);

  const discardChanges = useCallback(() => {
    console.log('Discarding changes');
    setDraftEquipment([]);
    setHasUnsavedChanges(false);
    toast({
      title: "Changes discarded",
      description: "All unsaved changes have been discarded",
    });
  }, []);

  const addBulkDraftEquipment = useCallback((equipmentList: DraftEquipment[]) => {
    console.log('Adding bulk draft equipment:', equipmentList.length, 'items');
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
