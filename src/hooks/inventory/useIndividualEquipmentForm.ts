
import { useState, useCallback } from 'react';
import { IndividualEquipment, EquipmentType } from '@/types/inventory';
import { toast } from 'sonner';

export const useIndividualEquipmentForm = (
  equipmentType: EquipmentType,
  allEquipment: IndividualEquipment[],
  onAddDraft: (equipment: any) => void,
  onUpdateEquipment: (equipment: IndividualEquipment[]) => void,
  existingEquipment: IndividualEquipment[]
) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<IndividualEquipment | null>(null);
  const [formData, setFormData] = useState({
    equipmentId: '',
    name: '',
    locationId: '',
    serialNumber: '',
    notes: '',
    selectedPrefix: equipmentType.name === 'Customer Computer' ? 'CC' : 
                   equipmentType.name === 'Customer Tablet' ? 'CT' : 
                   equipmentType.defaultIdPrefix || ''
  });

  const generateEquipmentId = useCallback((prefix: string, number: number) => {
    // Different padding for different equipment types
    if (prefix === 'SS') {
      return `${prefix}${number.toString().padStart(4, '0')}`;
    } else if (prefix === 'SL') {
      return `${prefix}${number.toString().padStart(2, '0')}`;
    } else {
      return `${prefix}${number.toString().padStart(3, '0')}`;
    }
  }, []);

  const generateEquipmentName = useCallback((prefix: string, id: string) => {
    if (prefix === 'CC') return `Customer Computer ${id.replace('CC', '')}`;
    if (prefix === 'CT') return `Customer Tablet ${id.replace('CT', '')}`;
    if (prefix === 'SL') return `Starlink ${id.replace('SL', '')}`;
    if (prefix === 'SS') return `ShearStream ${id.replace('SS', '')}`;
    if (prefix === 'PG') return `Pressure Gauge ${id.replace('PG', '')}`;
    if (prefix === 'BP') return `Battery Pack ${id.replace('BP', '')}`;
    return `${equipmentType.name} ${id}`;
  }, [equipmentType.name]);

  const getNextEquipmentId = useCallback((prefix: string) => {
    const existingIds = allEquipment.map(eq => eq.equipmentId);
    let counter = 1;
    let newId = generateEquipmentId(prefix, counter);
    
    while (existingIds.includes(newId)) {
      counter++;
      newId = generateEquipmentId(prefix, counter);
    }
    
    return newId;
  }, [allEquipment, generateEquipmentId]);

  const resetForm = useCallback(() => {
    const prefix = equipmentType.name === 'Company Computer' ? 'CC' : equipmentType.defaultIdPrefix || '';
    const nextId = getNextEquipmentId(prefix);
    
    setFormData({
      equipmentId: nextId,
      name: generateEquipmentName(prefix, nextId),
      locationId: '',
      serialNumber: '',
      notes: '',
      selectedPrefix: prefix
    });
    setEditingEquipment(null);
    setIsDialogOpen(false);
  }, [equipmentType, getNextEquipmentId, generateEquipmentName]);

  const handlePrefixChange = useCallback((prefix: string) => {
    const nextId = getNextEquipmentId(prefix);
    setFormData(prev => ({
      ...prev,
      equipmentId: nextId,
      name: generateEquipmentName(prefix, nextId),
      selectedPrefix: prefix
    }));
  }, [getNextEquipmentId, generateEquipmentName]);

  const handleEdit = useCallback((equipment: IndividualEquipment) => {
    setEditingEquipment(equipment);
    setFormData({
      equipmentId: equipment.equipmentId,
      name: equipment.name,
      locationId: equipment.locationId,
      serialNumber: equipment.serialNumber || '',
      notes: equipment.notes || '',
      selectedPrefix: equipment.equipmentId.substring(0, 2)
    });
    setIsDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async (saveImmediate = false) => {
    if (!formData.equipmentId.trim() || !formData.name.trim() || !formData.locationId) {
      toast.error('Equipment ID, name, and location are required');
      return;
    }

    const existingEquipmentItem = allEquipment.find(eq => 
      eq.equipmentId === formData.equipmentId && (!editingEquipment || eq.id !== editingEquipment.id)
    );
    
    if (existingEquipmentItem) {
      toast.error('Equipment ID already exists');
      return;
    }

    try {
      if (editingEquipment) {
        const updatedEquipment = existingEquipment.map(eq => 
          eq.id === editingEquipment.id 
            ? { ...eq, ...formData, typeId: equipmentType.id, status: editingEquipment.status }
            : eq
        );
        onUpdateEquipment(updatedEquipment);
        toast.success('Equipment updated successfully');
      } else {
        const newEquipment = {
          equipmentId: formData.equipmentId,
          name: formData.name,
          typeId: equipmentType.id,
          locationId: formData.locationId,
          status: 'available' as const,
          serialNumber: formData.serialNumber,
          notes: formData.notes
        };

        if (saveImmediate) {
          const updatedEquipment = [...existingEquipment, { ...newEquipment, id: `new-${Date.now()}`, lastUpdated: new Date() }];
          onUpdateEquipment(updatedEquipment);
          toast.success('Equipment saved successfully');
        } else {
          onAddDraft(newEquipment);
          toast.success('Equipment added to drafts');
        }
      }

      resetForm();
    } catch (error) {
      console.error('Error saving equipment:', error);
      toast.error('Failed to save equipment');
    }
  }, [formData, editingEquipment, allEquipment, equipmentType.id, existingEquipment, onUpdateEquipment, onAddDraft, resetForm]);

  return {
    isDialogOpen,
    setIsDialogOpen,
    editingEquipment,
    formData,
    setFormData,
    handleEdit,
    handleSubmit,
    resetForm,
    handlePrefixChange,
  };
};
