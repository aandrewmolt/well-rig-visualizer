
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';

interface ExtraEquipmentItemProps {
  extra: {
    id: string;
    equipmentTypeId: string;
    quantity: number;
    reason: string;
    addedDate: Date;
    notes?: string;
    individualEquipmentId?: string;
  };
  onRemove: (extraId: string) => void;
}

const ExtraEquipmentItem: React.FC<ExtraEquipmentItemProps> = ({
  extra,
  onRemove,
}) => {
  const { data } = useInventoryData();

  const getEquipmentTypeName = (typeId: string) => {
    return data.equipmentTypes.find(type => type.id === typeId)?.name || 'Unknown';
  };

  const getIndividualEquipmentName = (equipmentId: string) => {
    return data.individualEquipment.find(eq => eq.id === equipmentId)?.equipmentId || 'Unknown';
  };

  const equipmentType = data.equipmentTypes.find(type => type.id === extra.equipmentTypeId);
  const isIndividuallyTracked = equipmentType?.requiresIndividualTracking;

  return (
    <div className="flex items-start justify-between p-3 border rounded-lg bg-yellow-50 border-yellow-200">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-lg">{getEquipmentTypeName(extra.equipmentTypeId)}</span>
          {isIndividuallyTracked && extra.individualEquipmentId ? (
            <Badge variant="secondary" className="text-sm font-bold bg-blue-100 text-blue-800">
              {getIndividualEquipmentName(extra.individualEquipmentId)}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-sm">{extra.quantity}x</Badge>
          )}
          <Badge variant="outline" className="text-xs bg-yellow-100">
            Extra
          </Badge>
        </div>
        <div className="text-sm text-gray-600">
          <div><strong>Reason:</strong> {extra.reason}</div>
          <div><strong>Added:</strong> {extra.addedDate.toLocaleDateString()}</div>
          {extra.notes && (
            <div><strong>Notes:</strong> {extra.notes}</div>
          )}
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onRemove(extra.id)}
        className="h-7 w-7 p-0 ml-2"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default ExtraEquipmentItem;
