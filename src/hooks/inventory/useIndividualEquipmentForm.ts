
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
  const { generateEquipmentId, generateEquipmentName, getIdPadding } = useEquipmentIdGenerator();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<IndividualEquipment | null>(null);
  const [formData, setFormData] = useState<FormData>({
    equipmentId: '',
    name: '',
    locationId: '',
    serialNumber: '',
    notes: ''
  });

  const generateNextEquipmentId = useCallback(() => {
    const prefix = equipmentType.defaultIdPrefix || 'EQ-';
    const existingIds = allEquipment.map(eq => eq.equipmentId);
    let counter = 1;
    let newId = generateEquipmentId(equipmentType, counter);
    
    while (existingIds.includes(newId)) {
      counter++;
      newId = generateEquipmentId(equipmentType, counter);
    }
    
    return newId;
  }, [allEquipment, equipmentType, generateEquipmentId]);

  const handleAddItemClick = useCallback(() => {
    if (!editingEquipment) {
      const newId = generateNextEquipmentId();
      const newName = generateEquipmentName(equipmentType, newId);
      
      setFormData({
        equipmentId: newId,
        name: newName,
        locationId: '',
        serialNumber: '',
        notes: ''
      });
    }
    setIsDialogOpen(true);
  }, [editingEquipment, generateNextEquipmentId, generateEquipmentName, equipmentType]);

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
      notes: ''
    });
    setEditingEquipment(null);
    setIsDialogOpen(false);
  }, []);

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
  };
};
