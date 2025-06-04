
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Plus, Save, Loader2 } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { EquipmentType, StorageLocation } from '@/types/inventory';
import IndividualEquipmentForm from './IndividualEquipmentForm';

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draftItems, setDraftItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    equipmentId: '',
    name: '',
    locationId: '',
    serialNumber: '',
    notes: '',
    selectedPrefix: 'CC'
  });

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

  const existingEquipment = data.individualEquipment?.filter(eq => eq.typeId === equipmentType.id) || [];

  const generateNextId = (prefix: string = equipmentType.defaultIdPrefix || 'EQ') => {
    const allEquipment = [...existingEquipment, ...draftItems];
    const existingIds = allEquipment
      .map(eq => eq.equipmentId || eq.equipment_id)
      .filter(id => id?.startsWith(prefix))
      .map(id => {
        const num = id.replace(prefix, '').replace('-', '');
        return parseInt(num) || 0;
      });
    
    const nextNum = Math.max(0, ...existingIds) + 1;
    return `${prefix}-${nextNum.toString().padStart(3, '0')}`;
  };

  const handleSubmit = async (saveImmediate = false) => {
    if (!equipmentType) return;
    
    const finalPrefix = formData.selectedPrefix || equipmentType.defaultIdPrefix || 'EQ';
    const equipmentId = formData.equipmentId || generateNextId(finalPrefix);
    
    const defaultLocation = storageLocations.find(loc => loc.isDefault);
    
    const newItem = {
      equipmentId,
      name: formData.name || `${equipmentType.name} ${equipmentId}`,
      typeId: equipmentType.id,
      locationId: formData.locationId || defaultLocation?.id || storageLocations[0]?.id || '',
      status: 'available' as const,
      serialNumber: formData.serialNumber,
      notes: formData.notes,
      location_type: 'storage'
    };

    if (saveImmediate) {
      try {
        await addIndividualEquipment(newItem);
        onReset();
      } catch (error) {
        console.error('Failed to save equipment:', error);
      }
    } else {
      setDraftItems(prev => [...prev, newItem]);
      onDraftCountChange(draftItems.length + 1);
      onReset();
    }
  };

  const onReset = () => {
    const defaultLocation = storageLocations.find(loc => loc.isDefault);
    
    setFormData({
      equipmentId: '',
      name: '',
      locationId: defaultLocation?.id || storageLocations[0]?.id || '',
      serialNumber: '',
      notes: '',
      selectedPrefix: 'CC'
    });
    setIsFormOpen(false);
  };

  const saveDraftItems = async () => {
    try {
      for (const item of draftItems) {
        await addIndividualEquipment(item);
      }
      setDraftItems([]);
      onDraftCountChange(0);
    } catch (error) {
      console.error('Failed to save draft items:', error);
    }
  };

  if (storageLocations.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="text-sm font-medium">Individual Items</span>
          </div>
        </div>
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span className="text-sm font-medium">Individual Items</span>
          {draftItems.length > 0 && (
            <Badge variant="outline" className="bg-orange-50">
              {draftItems.length} draft
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {draftItems.length > 0 && (
            <Button size="sm" onClick={saveDraftItems} variant="outline">
              <Save className="h-3 w-3 mr-1" />
              Save All Drafts
            </Button>
          )}
          
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
      </div>

      {existingEquipment.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-gray-600 mb-2">Existing Items:</div>
            <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
              {existingEquipment.slice(0, 5).map(item => (
                <div key={item.id} className="flex justify-between text-xs p-1 bg-gray-50 rounded">
                  <span>{item.equipmentId}</span>
                  <Badge variant="outline" className="text-xs px-1">
                    {item.status}
                  </Badge>
                </div>
              ))}
              {existingEquipment.length > 5 && (
                <div className="text-xs text-gray-500 text-center">
                  +{existingEquipment.length - 5} more...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {draftItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-3">
            <div className="text-xs text-orange-700 mb-2">Draft Items (not saved):</div>
            <div className="space-y-1">
              {draftItems.map((item, index) => (
                <div key={index} className="flex justify-between text-xs p-1 bg-white rounded border">
                  <span>{item.equipmentId}</span>
                  <Badge variant="outline" className="text-xs px-1 border-orange-300">
                    draft
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IndividualEquipmentManager;
