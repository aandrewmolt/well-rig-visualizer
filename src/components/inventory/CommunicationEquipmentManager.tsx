
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, Monitor, Tablet, Box } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { useDraftEquipmentManager } from '@/hooks/useDraftEquipmentManager';
import CommunicationEquipmentSection from './CommunicationEquipmentSection';

const CommunicationEquipmentManager: React.FC = () => {
  const { data, updateIndividualEquipment } = useInventory();
  
  const communicationTypes = data.equipmentTypes.filter(type => 
    type.category === 'communication' && type.requiresIndividualTracking
  );

  const {
    draftEquipment,
    addDraftEquipment,
    addBulkDraftEquipment,
  } = useDraftEquipmentManager(data.individualEquipment, (equipment) => {
    updateIndividualEquipment(equipment);
  });

  const getEquipmentForType = (typeId: string) => {
    const existing = data.individualEquipment.filter(eq => eq.typeId === typeId);
    const drafts = draftEquipment.filter(eq => eq.typeId === typeId);
    return [...existing, ...drafts];
  };

  if (communicationTypes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">
            No communication equipment types found. Please add equipment types first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Communication Equipment Management
          </CardTitle>
          <p className="text-sm text-gray-600">
            Manage individual communication equipment items with bulk creation and duplicate prevention.
          </p>
        </CardHeader>
      </Card>

      {/* Priority order: SS, SL, CC, CT */}
      {['ShearStream Box', 'Starlink', 'Customer Computer', 'Customer Tablet'].map(typeName => {
        const equipmentType = communicationTypes.find(type => type.name === typeName);
        if (!equipmentType) return null;

        return (
          <CommunicationEquipmentSection
            key={equipmentType.id}
            equipmentType={equipmentType}
            equipment={getEquipmentForType(equipmentType.id)}
            storageLocations={data.storageLocations}
            onAddEquipment={addDraftEquipment}
            onBulkAdd={addBulkDraftEquipment}
          />
        );
      })}

      {draftEquipment.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-sm text-orange-700">
              Pending Changes ({draftEquipment.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-orange-600">
              Items are automatically saved after creation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommunicationEquipmentManager;
