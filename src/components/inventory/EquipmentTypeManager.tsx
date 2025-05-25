
import React, { useState, createContext } from 'react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { EquipmentType } from '@/types/inventory';
import { useEquipmentTypeForm } from '@/hooks/inventory/useEquipmentTypeForm';
import EquipmentTypeForm from './EquipmentTypeForm';
import EquipmentTypeCategorySection from './EquipmentTypeCategorySection';

// Context to share draft counts between components
const DraftCountContext = createContext<{ [typeId: string]: number }>({});

const EquipmentTypeManager = () => {
  const { data } = useInventoryData();
  const [selectedTypeForDetails, setSelectedTypeForDetails] = useState<EquipmentType | null>(null);
  const [draftCounts, setDraftCounts] = useState<{ [typeId: string]: number }>({});

  const {
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
  } = useEquipmentTypeForm();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cables': return 'bg-blue-100 text-blue-800';
      case 'gauges': return 'bg-green-100 text-green-800';
      case 'adapters': return 'bg-purple-100 text-purple-800';
      case 'communication': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateDraftCount = (typeId: string, count: number) => {
    console.log('Updating draft count for type', typeId, 'to', count);
    setDraftCounts(prev => ({ ...prev, [typeId]: count }));
  };

  const groupedTypes = data.equipmentTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, EquipmentType[]>);

  return (
    <DraftCountContext.Provider value={draftCounts}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Equipment Types</h2>
          <EquipmentTypeForm
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            editingType={editingType}
            setEditingType={setEditingType}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onReset={resetForm}
          />
        </div>

        <div className="space-y-6">
          {Object.entries(groupedTypes).map(([category, types]) => (
            <EquipmentTypeCategorySection
              key={category}
              category={category}
              types={types}
              equipmentItems={data.equipmentItems}
              individualEquipment={data.individualEquipment}
              storageLocations={data.storageLocations}
              draftCounts={draftCounts}
              selectedTypeForDetails={selectedTypeForDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleDetails={setSelectedTypeForDetails}
              onDraftCountChange={updateDraftCount}
              getCategoryColor={getCategoryColor}
            />
          ))}
        </div>
      </div>
    </DraftCountContext.Provider>
  );
};

export default EquipmentTypeManager;
