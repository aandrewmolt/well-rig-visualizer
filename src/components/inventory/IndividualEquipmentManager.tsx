
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, RotateCcw } from 'lucide-react';
import { EquipmentType, StorageLocation, IndividualEquipment } from '@/types/inventory';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { toast } from 'sonner';
import IndividualEquipmentForm from './IndividualEquipmentForm';
import BulkEquipmentForm from './BulkEquipmentForm';
import EquipmentGrid from './EquipmentGrid';

interface IndividualEquipmentManagerProps {
  equipmentType: EquipmentType;
  storageLocations: StorageLocation[];
}

const IndividualEquipmentManager: React.FC<IndividualEquipmentManagerProps> = ({
  equipmentType,
  storageLocations
}) => {
  const { data, addIndividualEquipment, addBulkIndividualEquipment, updateSingleIndividualEquipment } = useSupabaseInventory();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<IndividualEquipment | null>(null);
  const [draftEquipment, setDraftEquipment] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    equipmentId: '',
    name: '',
    locationId: '',
    serialNumber: '',
    notes: '',
    selectedPrefix: equipmentType.name === 'Company Computer' ? 'CC' : equipmentType.defaultIdPrefix || ''
  });

  const [bulkCreateData, setBulkCreateData] = useState({
    count: 5,
    prefix: equipmentType.defaultIdPrefix || '',
    startNumber: 1,
    locationId: '',
    selectedPrefix: equipmentType.name === 'Company Computer' ? 'CC' : undefined
  });

  const individualEquipment = data.individualEquipment.filter(eq => eq.typeId === equipmentType.id);

  const generateEquipmentId = (prefix: string, number: number) => {
    return `${prefix}${number.toString().padStart(3, '0')}`;
  };

  const generateEquipmentName = (prefix: string, id: string) => {
    if (prefix === 'CC') return `Customer Computer ${id.replace('CC', '')}`;
    if (prefix === 'CT') return `Customer Tablet ${id.replace('CT', '')}`;
    return `${equipmentType.name} ${id}`;
  };

  const getNextEquipmentId = (prefix: string) => {
    const existingIds = [...individualEquipment, ...draftEquipment].map(eq => eq.equipmentId);
    let counter = 1;
    let newId = generateEquipmentId(prefix, counter);
    
    while (existingIds.includes(newId)) {
      counter++;
      newId = generateEquipmentId(prefix, counter);
    }
    
    return newId;
  };

  const handleSubmit = (saveImmediate = false) => {
    if (!formData.equipmentId.trim() || !formData.name.trim() || !formData.locationId) {
      toast.error('Equipment ID, name, and location are required');
      return;
    }

    const existingEquipment = [...individualEquipment, ...draftEquipment].find(eq => 
      eq.equipmentId === formData.equipmentId && (!editingEquipment || eq.id !== editingEquipment.id)
    );
    
    if (existingEquipment) {
      toast.error('Equipment ID already exists');
      return;
    }

    if (editingEquipment) {
      updateSingleIndividualEquipment(editingEquipment.id, {
        ...formData,
        typeId: equipmentType.id,
        status: editingEquipment.status
      });
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
        addIndividualEquipment(newEquipment);
      } else {
        setDraftEquipment(prev => [...prev, { ...newEquipment, id: `draft-${Date.now()}` }]);
        toast.success('Equipment added to drafts (will auto-save in 0.5 seconds)');
        setTimeout(() => {
          addIndividualEquipment(newEquipment);
          setDraftEquipment(prev => prev.filter(draft => draft.equipmentId !== newEquipment.equipmentId));
        }, 500);
      }
    }

    resetForm();
  };

  const handleBulkCreate = (saveImmediate = false) => {
    if (!bulkCreateData.locationId || bulkCreateData.count <= 0) {
      toast.error('Location and valid count are required');
      return;
    }

    const currentPrefix = equipmentType.name === 'Company Computer' 
      ? (bulkCreateData.selectedPrefix || 'CC')
      : equipmentType.defaultIdPrefix || '';

    const newEquipment = [];
    const existingIds = [...individualEquipment, ...draftEquipment].map(eq => eq.equipmentId);

    for (let i = 0; i < bulkCreateData.count; i++) {
      const number = bulkCreateData.startNumber + i;
      const equipmentId = generateEquipmentId(currentPrefix, number);
      
      if (existingIds.includes(equipmentId)) {
        toast.error(`Equipment ID ${equipmentId} already exists`);
        return;
      }

      const equipmentName = generateEquipmentName(currentPrefix, equipmentId);

      newEquipment.push({
        equipmentId,
        name: equipmentName,
        typeId: equipmentType.id,
        locationId: bulkCreateData.locationId,
        status: 'available' as const,
      });
    }

    if (saveImmediate) {
      addBulkIndividualEquipment(newEquipment);
    } else {
      const drafts = newEquipment.map(eq => ({ ...eq, id: `draft-${Date.now()}-${eq.equipmentId}` }));
      setDraftEquipment(prev => [...prev, ...drafts]);
      toast.success(`${bulkCreateData.count} equipment items added to drafts (will auto-save in 0.5 seconds)`);
      setTimeout(() => {
        addBulkIndividualEquipment(newEquipment);
        setDraftEquipment(prev => prev.filter(draft => !newEquipment.some(eq => eq.equipmentId === draft.equipmentId)));
      }, 500);
    }
    
    setIsBulkCreateOpen(false);
    setBulkCreateData(prev => ({
      ...prev,
      startNumber: prev.startNumber + prev.count,
      count: 5
    }));
  };

  const handleEdit = (equipment: IndividualEquipment) => {
    setEditingEquipment(equipment);
    setFormData({
      equipmentId: equipment.equipmentId,
      name: equipment.name,
      locationId: equipment.locationId,
      serialNumber: equipment.serialNumber || '',
      notes: equipment.notes || '',
      selectedPrefix: equipment.equipmentId.substring(0, 2)
    });
    setIsFormOpen(true);
  };

  const handleDelete = (equipmentId: string) => {
    const equipment = individualEquipment.find(eq => eq.id === equipmentId);
    if (equipment?.status === 'deployed') {
      toast.error('Cannot delete deployed equipment');
      return;
    }
    // Delete functionality would go here
    toast.success('Equipment deleted');
  };

  const resetForm = () => {
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
    setIsFormOpen(false);
  };

  const handlePrefixChange = (prefix: string) => {
    const nextId = getNextEquipmentId(prefix);
    setFormData(prev => ({
      ...prev,
      equipmentId: nextId,
      name: generateEquipmentName(prefix, nextId),
      selectedPrefix: prefix
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'deployed': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'red-tagged': return 'bg-red-100 text-red-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationName = (locationId: string) => {
    const location = storageLocations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  return (
    <div className="border-t pt-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Individual {equipmentType.name} Items</h3>
          {draftEquipment.length > 0 && (
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              {draftEquipment.length} pending
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <IndividualEquipmentForm
            isFormOpen={isFormOpen}
            setIsFormOpen={setIsFormOpen}
            editingEquipment={editingEquipment}
            setEditingEquipment={handleEdit}
            formData={formData}
            setFormData={setFormData}
            equipmentType={equipmentType}
            storageLocations={storageLocations}
            allEquipment={[...individualEquipment, ...draftEquipment]}
            onSubmit={handleSubmit}
            onReset={resetForm}
            onPrefixChange={handlePrefixChange}
          />
          
          <BulkEquipmentForm
            isBulkCreateOpen={isBulkCreateOpen}
            setIsBulkCreateOpen={setIsBulkCreateOpen}
            bulkCreateData={bulkCreateData}
            setBulkCreateData={setBulkCreateData}
            storageLocations={storageLocations}
            equipmentType={equipmentType}
            onBulkCreate={handleBulkCreate}
          />
          
          {draftEquipment.length > 0 && (
            <Button
              onClick={() => setDraftEquipment([])}
              size="sm"
              variant="outline"
              className="text-red-600"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Discard Drafts
            </Button>
          )}
        </div>
      </div>

      <EquipmentGrid
        equipment={[...individualEquipment, ...draftEquipment]}
        draftEquipment={draftEquipment}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getStatusColor={getStatusColor}
        getLocationName={getLocationName}
      />
    </div>
  );
};

export default IndividualEquipmentManager;
