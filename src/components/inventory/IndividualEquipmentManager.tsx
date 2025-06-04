
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { EquipmentType, StorageLocation } from '@/types/inventory';
import { useIndividualEquipmentManager } from '@/hooks/inventory/useIndividualEquipmentManager';
import IndividualEquipmentForm from './IndividualEquipmentForm';
import BulkEquipmentCreationDialog from './BulkEquipmentCreationDialog';
import EquipmentGrid from './EquipmentGrid';
import IndividualEquipmentHeader from './individual/IndividualEquipmentHeader';
import IndividualEquipmentStats from './individual/IndividualEquipmentStats';
import DraftItemsList from './individual/DraftItemsList';

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
  const { isLoading } = useSupabaseInventory();
  
  const manager = useIndividualEquipmentManager(
    equipmentType!,
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
          draftCount={manager.draftEquipment.length}
          onSaveDrafts={manager.saveImmediately}
          onOpenForm={() => manager.setIsFormOpen(true)}
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
    const location = storageLocations.find(loc => loc.id === locationId);
    return location?.name || 'Unknown Location';
  };

  // Create a wrapper function that matches the expected signature
  const handleBulkCreateWrapper = (equipment: any[]) => {
    // The bulk creation dialog will pass the equipment array,
    // but our hook's handleBulkCreate expects no parameters
    // and handles the bulk creation internally
    manager.handleBulkCreate();
  };

  return (
    <div className="space-y-3">
      <IndividualEquipmentHeader
        draftCount={manager.draftEquipment.length}
        onSaveDrafts={manager.saveImmediately}
        onOpenForm={() => manager.setIsFormOpen(true)}
        onBulkCreate={() => manager.setIsBulkCreateOpen(true)}
      />

      <IndividualEquipmentStats equipment={manager.individualEquipment} />
      <DraftItemsList draftItems={manager.draftEquipment} />

      <EquipmentGrid
        equipment={manager.allEquipment}
        draftEquipment={manager.draftEquipment}
        onEdit={manager.setEditingEquipment}
        onDelete={manager.handleDelete}
        onStatusChange={manager.handleStatusChange}
        onLocationChange={manager.handleLocationChange}
        getStatusColor={getStatusColor}
        getLocationName={getLocationName}
        storageLocations={storageLocations}
      />

      <IndividualEquipmentForm
        isFormOpen={manager.isFormOpen}
        setIsFormOpen={manager.setIsFormOpen}
        editingEquipment={manager.editingEquipment}
        setEditingEquipment={manager.setEditingEquipment}
        formData={manager.formData}
        setFormData={manager.setFormData}
        equipmentType={equipmentType}
        storageLocations={storageLocations}
        allEquipment={manager.allEquipment}
        onSubmit={manager.handleSubmit}
        onReset={manager.resetForm}
        onPrefixChange={manager.handlePrefixChange}
      />

      <BulkEquipmentCreationDialog
        isOpen={manager.isBulkCreateOpen}
        onClose={() => manager.setIsBulkCreateOpen(false)}
        equipmentType={equipmentType}
        storageLocations={storageLocations}
        existingEquipment={manager.allEquipment}
        onBulkCreate={handleBulkCreateWrapper}
      />
    </div>
  );
};

export default IndividualEquipmentManager;
