
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';

interface EquipmentTypeItemProps {
  type: any;
  equipmentCounts: {
    equipmentItems: number;
    individualEquipment: number;
    totalQuantity: number;
  };
  canDelete: boolean;
  deleteDetails?: string[];
  onEdit: (type: any) => void;
  onDelete: (typeId: string, typeName: string) => void;
  getCategoryColor: (category: string) => string;
}

const EquipmentTypeItem: React.FC<EquipmentTypeItemProps> = ({
  type,
  equipmentCounts,
  canDelete,
  deleteDetails,
  onEdit,
  onDelete,
  getCategoryColor,
}) => {
  const totalItems = equipmentCounts.equipmentItems + equipmentCounts.individualEquipment;

  return (
    <Card key={type.id} className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-sm">{type.name}</h3>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(type)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(type.id, type.name)}
              disabled={!canDelete}
              className={canDelete ? "hover:text-red-600" : "opacity-50 cursor-not-allowed"}
              title={canDelete ? "Delete equipment type" : `Cannot delete - ${deleteDetails?.join(', ')}`}
            >
              {!canDelete && <AlertTriangle className="h-3 w-3 mr-1" />}
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Badge className={getCategoryColor(type.category)}>
            {type.category}
          </Badge>
          
          {totalItems > 0 && (
            <div className="text-xs text-blue-600 font-medium">
              {equipmentCounts.equipmentItems > 0 && (
                <div>{equipmentCounts.equipmentItems} item records ({equipmentCounts.totalQuantity} total)</div>
              )}
              {equipmentCounts.individualEquipment > 0 && (
                <div>{equipmentCounts.individualEquipment} individual items</div>
              )}
            </div>
          )}
          
          {type.description && (
            <p className="text-xs text-gray-600">{type.description}</p>
          )}
          
          {type.defaultIdPrefix && (
            <div className="text-xs text-gray-500">
              Prefix: {type.defaultIdPrefix}
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            Individual Tracking: {type.requiresIndividualTracking ? 'Yes' : 'No'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentTypeItem;
