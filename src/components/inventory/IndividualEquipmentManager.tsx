
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Save } from 'lucide-react';
import { EquipmentType } from '@/types/inventory';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useIndividualEquipmentManager } from '@/hooks/inventory/useIndividualEquipmentManager';
import IndividualEquipmentForm from './IndividualEquipmentForm';
import BulkEquipmentForm from './BulkEquipmentForm';
import EquipmentGrid from './EquipmentGrid';
import SaveControlBar from './SaveControlBar';

interface IndividualEquipmentManagerProps {
  equipmentType: EquipmentType;
  onDraftCountChange?: (count: number) => void;
}

const IndividualEquipmentManager: React.FC<IndividualEquipmentManagerProps> = ({ 
  equipmentType, 
  onDraftCountChange 
}) => {
  const { data } = useSupabaseInventory();
  const {
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
    handleAddItemClick,
    handleSubmit,
    handleBulkCreate,
    handleEdit,
    handleDelete,
    saveImmediately,
    discardChanges,
    getStatusColor,
    getLocationName,
  } = useIndividualEquipmentManager(equipmentType, onDraftCountChange);

  // Add before-unload warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Individual {equipmentType.name} Items
              <Badge variant="outline">{individualEquipment.length} saved</Badge>
              {draftEquipment.length > 0 && (
                <Badge className="bg-orange-100 text-orange-800">
                  {draftEquipment.length} draft
                </Badge>
              )}
              <Badge variant="secondary">
                {allEquipment.length} total
              </Badge>
            </div>
            <div className="flex gap-2">
              {hasUnsavedChanges && (
                <Button onClick={saveImmediately} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Save className="mr-2 h-4 w-4" />
                  Save All Now
                </Button>
              )}
              
              <BulkEquipmentForm
                isBulkCreateOpen={isBulkCreateOpen}
                setIsBulkCreateOpen={setIsBulkCreateOpen}
                bulkCreateData={bulkCreateData}
                setBulkCreateData={setBulkCreateData}
                storageLocations={data.storageLocations}
                equipmentTypeName={equipmentType.name}
                onBulkCreate={handleBulkCreate}
              />

              <IndividualEquipmentForm
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
                editingEquipment={editingEquipment}
                formData={formData}
                setFormData={setFormData}
                storageLocations={data.storageLocations}
                onSubmit={handleSubmit}
                onAddItemClick={handleAddItemClick}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EquipmentGrid
            equipment={allEquipment}
            draftEquipment={draftEquipment}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getStatusColor={getStatusColor}
            getLocationName={getLocationName}
          />
        </CardContent>
      </Card>

      <SaveControlBar
        hasUnsavedChanges={hasUnsavedChanges}
        unsavedCount={unsavedCount}
        onSave={saveImmediately}
        onDiscard={discardChanges}
      />
    </>
  );
};

export default IndividualEquipmentManager;
