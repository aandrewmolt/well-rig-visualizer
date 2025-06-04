
import { useState, useCallback } from 'react';
import { IndividualEquipment, EquipmentType } from '@/types/inventory';
import { FormData } from './types/individualEquipmentTypes';
import { toast } from '@/hooks/use-toast';
import { DraftEquipment } from '@/hooks/useDraftEquipmentManager';
import { useEquipmentIdGenerator } from './useEquipmentIdGenerator';

export const useIndividualEquipmentForm = (
  equipmentType: EquipmentType,
  allEquipment: IndividualEquipment[],
  addDraftEquipment: (equipment: DraftEquipment, saveImmediate?: boolean) => void,
  updateIndividualEquipment: (equipment: IndividualEquipment[]) => void,
  individualEquipment: IndividualEquipment[]
) => {
  const { generateEquipmentId, generateEquipmentName } = useEquipmentIdGenerator();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<IndividualEquipment | null>(null);
  const [selectedPrefix, setSelectedPrefix] = useState<string>(equipmentType.defaultIdPrefix || 'CC');
  const [formData, setFormData] = useState<FormData & { selectedPrefix?: string }>({
    equipmentId: '',
    name: '',
    locationId: '',
    serialNumber: '',
    notes: '',
    selectedPrefix: equipmentType.defaultIdPrefix || 'CC'
  });

  const generateNextEquipmentId = useCallback((prefix?: string) => {
    const actualPrefix = prefix || selectedPrefix || equipmentType.defaultIdPrefix || 'EQ-';
    const existingIds = allEquipment.map(eq => eq.equipmentId);
    let counter = 1;
    
    // Create a temporary equipment type with the selected prefix for ID generation
    const tempEquipmentType = { ...equipmentType, defaultIdPrefix: actualPrefix };
    let newId = generateEquipmentId(tempEquipmentType, counter);
    
    while (existingIds.includes(newId)) {
      counter++;
      newId = generateEquipmentId(tempEquipmentType, counter);
    }
    
    return newId;
  }, [allEquipment, equipmentType, generateEquipmentId, selectedPrefix]);

  const handlePrefixChange = useCallback((prefix: string) => {
    setSelectedPrefix(prefix);
    
    if (!editingEquipment) {
      // Generate new ID and name with the selected prefix
      const tempEquipmentType = { ...equipmentType, defaultIdPrefix: prefix };
      const newId = generateNextEquipmentId(prefix);
      const newName = generateEquipmentName(tempEquipmentType, newId);
      
      setFormData(prev => ({
        ...prev,
        equipmentId: newId,
        name: newName,
        selectedPrefix: prefix
      }));
    }
  }, [editingEquipment, generateNextEquipmentId, generateEquipmentName, equipmentType]);

  const handleAddItemClick = useCallback(() => {
    if (!editingEquipment) {
      const prefix = equipmentType.name === 'Company Computer' ? selectedPrefix : equipmentType.defaultIdPrefix;
      const tempEquipmentType = { ...equipmentType, defaultIdPrefix: prefix };
      const newId = generateNextEquipmentId(prefix);
      const newName = generateEquipmentName(tempEquipmentType, newId);
      
      setFormData({
        equipmentId: newId,
        name: newName,
        locationId: '',
        serialNumber: '',
        notes: '',
        selectedPrefix: prefix
      });
    }
    setIsDialogOpen(true);
  }, [editingEquipment, generateNextEquipmentId, generateEquipmentName, equipmentType, selectedPrefix]);

  const handleSubmit = useCallback((saveImmediate = false) => {
    if (!formData.equipmentId.trim() || !formData.name.trim() || !formData.locationId) {
      toast({
        title: "Validation Error",
        description: "Equipment ID, name, and location are required",
        variant: "destructive",
      });
      return;
    }

    const existingEquipment = allEquipment.find(eq => 
      eq.equipmentId === formData.equipmentId && (!editingEquipment || eq.id !== editingEquipment.id)
    );
    
    if (existingEquipment) {
      toast({
        title: "Duplicate ID",
        description: "Equipment ID already exists",
        variant: "destructive",
      });
      return;
    }

    if (editingEquipment) {
      const updatedEquipment = individualEquipment.map(equipment =>
        equipment.id === editingEquipment.id
          ? { 
              ...equipment, 
              ...formData,
              lastUpdated: new Date()
            }
          : equipment
      );
      updateIndividualEquipment(updatedEquipment);
      toast({
        title: "Equipment Updated",
        description: "Equipment updated successfully",
      });
    } else {
      const newEquipment: DraftEquipment = {
        typeId: equipmentType.id,
        status: 'available',
        ...formData
      };
      addDraftEquipment(newEquipment, saveImmediate);
      toast({
        title: "Equipment Added",
        description: saveImmediate ? "Equipment saved successfully" : "Equipment added to drafts (will auto-save in 0.5 seconds)",
      });
    }

    resetForm();
  }, [formData, allEquipment, editingEquipment, individualEquipment, updateIndividualEquipment, equipmentType.id, addDraftEquipment]);

  const handleEdit = useCallback((equipment: IndividualEquipment) => {
    setEditingEquipment(equipment);
    setFormData({
      equipmentId: equipment.equipmentId,
      name: equipment.name,
      locationId: equipment.locationId,
      serialNumber: equipment.serialNumber || '',
      notes: equipment.notes || ''
    });
    setIsDialogOpen(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      equipmentId: '',
      name: '',
      locationId: '',
      serialNumber: '',
      notes: '',
      selectedPrefix: equipmentType.defaultIdPrefix || 'CC'
    });
    setEditingEquipment(null);
    setIsDialogOpen(false);
  }, [equipmentType.defaultIdPrefix]);

  return {
    isDialogOpen,
    setIsDialogOpen,
    editingEquipment,
    formData,
    setFormData,
    handleAddItemClick,
    handleSubmit,
    handleEdit,
    resetForm,
    handlePrefixChange,
  };
};
