
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Edit2, Trash2 } from 'lucide-react';
import { IndividualEquipment } from '@/types/inventory';

interface EquipmentGridProps {
  equipment: IndividualEquipment[];
  draftEquipment: any[];
  onEdit: (equipment: IndividualEquipment) => void;
  onDelete: (equipmentId: string) => void;
  getStatusColor: (status: string) => string;
  getLocationName: (locationId: string) => string;
}

const EquipmentGrid: React.FC<EquipmentGridProps> = ({
  equipment,
  draftEquipment,
  onEdit,
  onDelete,
  getStatusColor,
  getLocationName,
}) => {
  if (equipment.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>No individual equipment items created yet</p>
        <p className="text-sm">Use "Add Item" or "Bulk Create" to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {equipment.map(item => {
        const isDraft = draftEquipment.some(draft => draft.equipmentId === item.equipmentId);
        return (
          <div 
            key={item.id} 
            className={`border rounded-lg p-4 ${isDraft ? 'border-orange-200 bg-orange-50' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-lg flex items-center gap-2">
                  {item.equipmentId}
                  {isDraft && <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs">Draft</Badge>}
                </h3>
                <p className="text-sm text-gray-600">{item.name}</p>
              </div>
              <div className="flex space-x-1">
                <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onDelete(item.id)}
                  disabled={item.status === 'deployed'}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Badge className={getStatusColor(item.status)}>
                {item.status}
              </Badge>
              
              <div className="text-sm text-gray-600">
                <div>Location: {getLocationName(item.locationId)}</div>
                {item.serialNumber && (
                  <div>S/N: {item.serialNumber}</div>
                )}
                {item.notes && (
                  <div>Notes: {item.notes}</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EquipmentGrid;
