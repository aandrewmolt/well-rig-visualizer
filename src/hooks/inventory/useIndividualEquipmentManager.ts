
import { useState, useEffect, useMemo, useCallback } from 'react';
import { IndividualEquipment, EquipmentType } from '@/types/inventory';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useDraftEquipmentManager, DraftEquipment } from '@/hooks/useDraftEquipmentManager';
import { toast } from '@/hooks/use-toast';

interface FormData {
  equipmentId: string;
  name: string;
  locationId: string;
  serialNumber: string;
  notes: string;
}

interface BulkCreateData {
  count: number;
  prefix: string;
  startNumber: number;
  locationId: string;
}

export const useIndividualEquipmentManager = (
  equipmentType: EquipmentType,
  onDraftCountChange?: (count: number) => void
) => {
  const { data, updateIndividualEquipment } = useInventoryData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<IndividualEquipment | null>(null);
  const [formData, setFormData] = useState<FormData>({
    equipmentId: '',
    name: '',
    locationId: '',
    serialNumber: '',
    notes: ''
  });
  const [bulkCreateData, setBulkCreateData] = useState<BulkCreateData>({
    count: 5,
    prefix: equipmentType.defaultIdPrefix || '',
    startNumber: 1,
    locationId: ''
  });

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
  } = useDraftEquipmentManager(individualEquipment, updateIndividualEquipment);

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

  const generateNextEquipmentId = useCallback(() => {
    const prefix = equipmentType.defaultIdPrefix || 'EQ-';
    const existingIds = allEquipment.map(eq => eq.equipmentId);
    let counter = 1;
    let newId = `${prefix}${counter.toString().padStart(3, '0')}`;
    
    while (existingIds.includes(newId)) {
      counter++;
      newId = `${prefix}${counter.toString().padStart(3, '0')}`;
    }
    
    return newId;
  }, [allEquipment, equipmentType.defaultIdPrefix]);

  const handleAddItemClick = useCallback(() => {
    if (!editingEquipment) {
      setFormData({
        equipmentId: generateNextEquipmentId(),
        name: '',
        locationId: '',
        serialNumber: '',
        notes: ''
      });
    }
    setIsDialogOpen(true);
  }, [editingEquipment, generateNextEquipmentId]);

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
      const updatedEquipment = data.individualEquipment.map(equipment =>
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
        description: saveImmediate ? "Equipment saved successfully" : "Equipment added to drafts (will auto-save in 1 second)",
      });
    }

    resetForm();
  }, [formData, allEquipment, editingEquipment, data.individualEquipment, updateIndividualEquipment, equipmentType.id, addDraftEquipment]);

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
      const equipmentId = `${bulkCreateData.prefix}${number.toString().padStart(3, '0')}`;
      
      if (existingIds.includes(equipmentId)) {
        toast({
          title: "Duplicate ID",
          description: `Equipment ID ${equipmentId} already exists`,
          variant: "destructive",
        });
        return;
      }

      newEquipment.push({
        equipmentId,
        name: `${equipmentType.name} ${equipmentId}`,
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
        : `${bulkCreateData.count} equipment items added to drafts (will auto-save in 1 second)`,
    });
    setIsBulkCreateOpen(false);
    setBulkCreateData({
      count: 5,
      prefix: equipmentType.defaultIdPrefix || '',
      startNumber: bulkCreateData.startNumber + bulkCreateData.count,
      locationId: ''
    });
  }, [bulkCreateData, allEquipment, equipmentType, addBulkDraftEquipment]);

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

  const handleDelete = useCallback((equipmentId: string) => {
    const equipment = individualEquipment.find(eq => eq.id === equipmentId);
    if (equipment?.status === 'deployed') {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete deployed equipment",
        variant: "destructive",
      });
      return;
    }

    const updatedEquipment = data.individualEquipment.filter(eq => eq.id !== equipmentId);
    updateIndividualEquipment(updatedEquipment);
    toast({
      title: "Equipment Deleted",
      description: "Equipment deleted successfully",
    });
  }, [individualEquipment, data.individualEquipment, updateIndividualEquipment]);

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

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'deployed': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'red-tagged': return 'bg-red-100 text-red-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getLocationName = useCallback((locationId: string) => {
    return data.storageLocations.find(loc => loc.id === locationId)?.name || 'Unknown';
  }, [data.storageLocations]);

  return {
    // State
    isDialogOpen,
    setIsDialogOpen,
    isBulkCreateOpen,
    setIsBulkCreateOpen,
    editingEquipment,
    formData,
    setFormData,
    bulkCreateData,
    setBulkCreateData,
    individualEquipment,
    draftEquipment,
    allEquipment,
    hasUnsavedChanges,
    unsavedCount,
    
    // Handlers
    handleAddItemClick,
    handleSubmit,
    handleBulkCreate,
    handleEdit,
    handleDelete,
    saveImmediately,
    discardChanges,
    getStatusColor,
    getLocationName,
  };
};
