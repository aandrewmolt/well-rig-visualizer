
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { EquipmentType, StorageLocation } from '@/types/inventory';
import IndividualEquipmentForm from './IndividualEquipmentForm';
import IndividualEquipmentHeader from './individual/IndividualEquipmentHeader';
import IndividualEquipmentStats from './individual/IndividualEquipmentStats';
import DraftItemsList from './individual/DraftItemsList';
import { useIndividualEquipmentLogic } from './individual/useIndividualEquipmentLogic';

interface IndividualEquipmentManagerProps {
  equipmentType?: EquipmentType;
  storageLocations: StorageLocation[];
  onDraftCountChange: (count: number) => void;
}

const IndividualEquipmentManager: React.FC<IndividualEquipmentManagerProps> = ({
  equipmentType,
  storageLocations,
  onDraftCountChange,
}) => {
  const { data, addIndividualEquipment, isLoading } = useSupabaseInventory();
  
  // Create a wrapper function that converts Promise<data> to Promise<void>
  const addEquipmentWrapper = async (equipment: any): Promise<void> => {
    await addIndividualEquipment(equipment);
  };
  
  const {
    isFormOpen,
    setIsFormOpen,
    draftItems,
    formData,
    setFormData,
    handleSubmit,
    onReset,
    saveDraftItems,
  } = useIndividualEquipmentLogic(
    equipmentType,
    storageLocations,
    addEquipmentWrapper,
    onDraftCountChange
  );

  // Show loading state while data is being fetched
  if (isLoading || !equipmentType) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading equipment data...</span>
        </div>
      </div>
    );
  }

  if (storageLocations.length === 0) {
    return (
      <div className="space-y-3">
        <IndividualEquipmentHeader
          draftCount={draftItems.length}
          onSaveDrafts={saveDraftItems}
          onOpenForm={() => setIsFormOpen(true)}
        />
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-3">
            <p className="text-sm text-orange-700">
              No storage locations found. Please add storage locations first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const existingEquipment = data.individualEquipment?.filter(eq => eq.typeId === equipmentType.id) || [];

  return (
    <div className="space-y-3">
      <IndividualEquipmentHeader
        draftCount={draftItems.length}
        onSaveDrafts={saveDraftItems}
        onOpenForm={() => setIsFormOpen(true)}
      />

      <IndividualEquipmentStats equipment={existingEquipment} />
      <DraftItemsList draftItems={draftItems} />

      <IndividualEquipmentForm
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        editingEquipment={null}
        setEditingEquipment={() => {}}
        formData={formData}
        setFormData={setFormData}
        equipmentType={equipmentType}
        storageLocations={storageLocations}
        allEquipment={existingEquipment}
        onSubmit={handleSubmit}
        onReset={onReset}
        onPrefixChange={(prefix) => setFormData(prev => ({ ...prev, selectedPrefix: prefix }))}
      />
    </div>
  );
};

export default IndividualEquipmentManager;
