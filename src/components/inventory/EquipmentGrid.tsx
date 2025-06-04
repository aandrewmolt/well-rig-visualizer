
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Edit2, Trash2, MapPin } from 'lucide-react';
import { IndividualEquipment } from '@/types/inventory';

interface EquipmentGridProps {
  equipment: IndividualEquipment[];
  draftEquipment: any[];
  onEdit: (equipment: IndividualEquipment) => void;
  onDelete: (equipmentId: string) => void;
  onStatusChange?: (equipmentId: string, status: string) => void;
  onLocationChange?: (equipmentId: string, locationId: string) => void;
  getStatusColor: (status: string) => string;
  getLocationName: (locationId: string) => string;
  storageLocations?: any[];
}

const EquipmentGrid: React.FC<EquipmentGridProps> = ({
  equipment,
  draftEquipment,
  onEdit,
  onDelete,
  onStatusChange,
  onLocationChange,
  getStatusColor,
  getLocationName,
  storageLocations = [],
}) => {
  if (equipment.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>No individual equipment items created yet</p>
        <p className="text-sm">Use "Add One" or "Bulk Add" to get started</p>
      </div>
    );
  }

  const handleEditClick = (item: IndividualEquipment) => {
    console.log('Edit button clicked for:', item);
    onEdit(item);
  };

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
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleEditClick(item)}
                  title="Edit equipment"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onDelete(item.id)}
                  disabled={item.status === 'deployed'}
                  className="text-red-600 hover:text-red-700"
                  title="Delete equipment"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Status:</span>
                {onStatusChange ? (
                  <Select 
                    value={item.status} 
                    onValueChange={(value) => onStatusChange(item.id, value)}
                  >
                    <SelectTrigger className="h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="deployed">Deployed</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="red-tagged">Red Tagged</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">Location:</span>
                {onLocationChange && storageLocations.length > 0 ? (
                  <Select 
                    value={item.locationId} 
                    onValueChange={(value) => onLocationChange(item.id, value)}
                  >
                    <SelectTrigger className="h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {storageLocations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-xs">{getLocationName(item.locationId)}</span>
                )}
              </div>
              
              {item.serialNumber && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">S/N:</span> {item.serialNumber}
                </div>
              )}
              {item.notes && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Notes:</span> {item.notes}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EquipmentGrid;
