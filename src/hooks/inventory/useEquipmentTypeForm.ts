
import { useState } from 'react';
import { EquipmentType } from '@/types/inventory';
import { useInventoryData } from '@/hooks/useInventoryData';
import { toast } from 'sonner';

interface FormData {
  name: string;
  category: EquipmentType['category'];
  description: string;
  requiresIndividualTracking: boolean;
  defaultIdPrefix: string;
}

export const useEquipmentTypeForm = () => {
  const { data, updateEquipmentTypes } = useInventoryData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<EquipmentType | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: 'cables',
    description: '',
    requiresIndividualTracking: false,
    defaultIdPrefix: ''
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Equipment name is required');
      return;
    }

    if (editingType) {
      // Update existing type
      const updatedTypes = data.equipmentTypes.map(type =>
        type.id === editingType.id
          ? { ...type, ...formData }
          : type
      );
      updateEquipmentTypes(updatedTypes);
      toast.success('Equipment type updated successfully');
    } else {
      // Add new type - show tracking prompt
      if (formData.requiresIndividualTracking && !formData.defaultIdPrefix.trim()) {
        toast.error('Please provide a default ID prefix for individually tracked equipment');
        return;
      }

      const newType: EquipmentType = {
        id: Date.now().toString(),
        ...formData
      };
      updateEquipmentTypes([...data.equipmentTypes, newType]);
      
      if (formData.requiresIndividualTracking) {
        toast.success(`Equipment type added with individual tracking enabled (prefix: ${formData.defaultIdPrefix})`);
      } else {
        toast.success('Equipment type added successfully');
      }
    }

    resetForm();
  };

  const handleEdit = (type: EquipmentType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      category: type.category,
      description: type.description || '',
      requiresIndividualTracking: type.requiresIndividualTracking,
      defaultIdPrefix: type.defaultIdPrefix || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (typeId: string) => {
    // Check if any equipment items use this type
    const hasItems = data.equipmentItems.some(item => item.typeId === typeId);
    const hasIndividualItems = data.individualEquipment.some(eq => eq.typeId === typeId);
    
    if (hasItems || hasIndividualItems) {
      toast.error('Cannot delete equipment type that has inventory items');
      return;
    }

    const updatedTypes = data.equipmentTypes.filter(type => type.id !== typeId);
    updateEquipmentTypes(updatedTypes);
    toast.success('Equipment type deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'cables',
      description: '',
      requiresIndividualTracking: false,
      defaultIdPrefix: ''
    });
    setEditingType(null);
    setIsDialogOpen(false);
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    editingType,
    setEditingType,
    formData,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
  };
};
