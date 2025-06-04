
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Clock, Plus, Trash2 } from 'lucide-react';
import { EquipmentType, StorageLocation } from '@/types/inventory';
import { useIndividualEquipmentManager } from '@/hooks/inventory/useIndividualEquipmentManager';
import IndividualEquipmentForm from './IndividualEquipmentForm';
import BulkEquipmentForm from './BulkEquipmentForm';

interface IndividualEquipmentManagerProps {
  equipmentType: EquipmentType;
  storageLocations: StorageLocation[];
  onDraftCountChange?: (count: number) => void;
}

const IndividualEquipmentManager: React.FC<IndividualEquipmentManagerProps> = ({
  equipmentType,
  storageLocations,
  onDraftCountChange
}) => {
  const {
    individualEquipment,
    draftEquipment,
    allEquipment,
    hasUnsavedChanges,
    unsavedCount,
    
    // Form management
    isFormOpen,
    setIsFormOpen,
    editingEquipment,
    setEditingEquipment,
    formData,
    setFormData,
    handleSubmit,
    resetForm,
    
    // Bulk creation
    isBulkCreateOpen,
    setIsBulkCreateOpen,
    bulkCreateData,
    setBulkCreateData,
    handleBulkCreate,
    
    // Operations
    handleStatusChange,
    handleLocationChange,
    handleDelete,
    
    // Draft management
    saveImmediately,
    discardChanges,
  } = useIndividualEquipmentManager(equipmentType, onDraftCountChange);

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
    return storageLocations.find(loc => loc.id === locationId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold">{equipmentType.name} Units</h3>
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {unsavedCount} unsaved changes
            </Badge>
          )}
        </div>
        
        <div className="flex space-x-2">
          {hasUnsavedChanges && (
            <>
              <Button onClick={saveImmediately} size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Now
              </Button>
              <Button onClick={discardChanges} size="sm" variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Discard
              </Button>
            </>
          )}
          
          <IndividualEquipmentForm
            isFormOpen={isFormOpen}
            setIsFormOpen={setIsFormOpen}
            editingEquipment={editingEquipment}
            setEditingEquipment={setEditingEquipment}
            formData={formData}
            setFormData={setFormData}
            equipmentType={equipmentType}
            storageLocations={storageLocations}
            allEquipment={allEquipment}
            onSubmit={handleSubmit}
            onReset={resetForm}
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
        </div>
      </div>

      {/* Equipment List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Individual Equipment ({allEquipment.length} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allEquipment.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Plus className="mx-auto h-8 w-8 mb-2" />
              <p>No individual equipment created yet</p>
              <p className="text-sm">Use the buttons above to add equipment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allEquipment.map((equipment) => {
                const isDraft = draftEquipment.some(draft => 
                  draft.equipmentId === equipment.equipmentId
                );
                
                return (
                  <div
                    key={equipment.equipmentId}
                    className={`border rounded-lg p-3 ${isDraft ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{equipment.equipmentId}</span>
                      {isDraft && (
                        <Badge variant="secondary" className="text-xs bg-yellow-200 text-yellow-800">
                          Draft
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span> {equipment.name}
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>{' '}
                        <Badge className={`text-xs ${getStatusColor(equipment.status)}`}>
                          {equipment.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-600">Location:</span> {getLocationName(equipment.locationId)}
                      </div>
                      {equipment.serialNumber && (
                        <div>
                          <span className="text-gray-600">Serial:</span> {equipment.serialNumber}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-1 mt-3">
                      <Button
                        onClick={() => setEditingEquipment(equipment)}
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(equipment.equipmentId)}
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IndividualEquipmentManager;
