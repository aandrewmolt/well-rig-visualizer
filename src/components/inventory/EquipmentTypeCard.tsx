
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Package } from 'lucide-react';
import { EquipmentType, EquipmentItem, IndividualEquipment, StorageLocation } from '@/types/inventory';
import EquipmentQuantityEditor from './EquipmentQuantityEditor';
import IndividualEquipmentManager from './IndividualEquipmentManager';

interface EquipmentTypeCardProps {
  type: EquipmentType;
  typeItems: EquipmentItem[];
  individualItems: IndividualEquipment[];
  draftCount: number;
  storageLocations: StorageLocation[];
  selectedTypeForDetails: EquipmentType | null;
  onEdit: (type: EquipmentType) => void;
  onDelete: (typeId: string) => void;
  onToggleDetails: (type: EquipmentType | null) => void;
  onDraftCountChange: (typeId: string, count: number) => void;
  getCategoryColor: (category: string) => string;
}

const EquipmentTypeCard: React.FC<EquipmentTypeCardProps> = ({
  type,
  typeItems,
  individualItems,
  draftCount,
  storageLocations,
  selectedTypeForDetails,
  onEdit,
  onDelete,
  onToggleDetails,
  onDraftCountChange,
  getCategoryColor,
}) => {
  const itemCount = typeItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalIndividualCount = individualItems.length + draftCount;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-lg flex items-center gap-2">
            {type.name}
            {type.requiresIndividualTracking && (
              <Badge variant="outline" className="text-xs">
                <Package className="h-3 w-3 mr-1" />
                Individual Tracking
              </Badge>
            )}
          </h3>
          {type.description && (
            <p className="text-sm text-gray-600">{type.description}</p>
          )}
        </div>
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(type)}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(type.id)}
            disabled={itemCount > 0 || totalIndividualCount > 0}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <Badge className={getCategoryColor(type.category)}>
          {type.category}
        </Badge>
        <div className="text-sm font-medium text-gray-700">
          {type.requiresIndividualTracking ? (
            <span>
              {individualItems.length} saved
              {draftCount > 0 && (
                <span className="text-orange-600"> + {draftCount} draft</span>
              )}
              {' = '}
              <span className="font-bold">{totalIndividualCount} total items</span>
            </span>
          ) : (
            <span>Total: {itemCount} items</span>
          )}
        </div>
      </div>

      {!type.requiresIndividualTracking && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Manage Quantities:</span>
            <EquipmentQuantityEditor
              equipmentTypeId={type.id}
              equipmentTypeName={type.name}
              currentItems={typeItems}
            />
          </div>
          
          {typeItems.length > 0 && (
            <div className="grid grid-cols-1 gap-1">
              {typeItems.map(item => (
                <div key={item.id} className="flex justify-between text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                  <span>{storageLocations.find(loc => loc.id === item.locationId)?.name}</span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium">{item.quantity}</span>
                    <Badge variant={
                      item.status === 'available' ? 'default' :
                      item.status === 'deployed' ? 'secondary' : 'destructive'
                    } className="text-xs px-1 py-0">
                      {item.status}
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {type.requiresIndividualTracking && (
        <div className="mt-4 border-t pt-4">
          <IndividualEquipmentManager 
            equipmentType={type}
            storageLocations={storageLocations}
            onDraftCountChange={(count) => onDraftCountChange(type.id, count)}
          />
        </div>
      )}
    </div>
  );
};

export default EquipmentTypeCard;
