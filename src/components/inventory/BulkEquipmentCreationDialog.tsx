
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, AlertCircle } from 'lucide-react';
import { EquipmentType, StorageLocation, IndividualEquipment } from '@/types/inventory';
import { toast } from 'sonner';

interface BulkEquipmentCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentType: EquipmentType;
  storageLocations: StorageLocation[];
  existingEquipment: IndividualEquipment[];
  onBulkCreate: (equipment: any[]) => void;
}

const BulkEquipmentCreationDialog: React.FC<BulkEquipmentCreationDialogProps> = ({
  isOpen,
  onClose,
  equipmentType,
  storageLocations,
  existingEquipment,
  onBulkCreate,
}) => {
  const [bulkData, setBulkData] = useState({
    count: 5,
    startNumber: 1,
    locationId: '',
  });
  const [duplicateWarnings, setDuplicateWarnings] = useState<string[]>([]);

  const prefix = equipmentType.defaultIdPrefix || 'EQ-';

  const generateEquipmentName = (id: string) => {
    const number = id.replace(prefix, '');
    switch (prefix) {
      case 'CC-': return `Customer Computer ${number}`;
      case 'CT-': return `Customer Tablet ${number}`;
      case 'SL-': return `Starlink ${number}`;
      case 'SS-': return `ShearStream Box ${number}`;
      case 'PG-': return `Pressure Gauge ${number}`;
      default: return `${equipmentType.name} ${id}`;
    }
  };

  const checkForDuplicates = () => {
    const warnings: string[] = [];
    const existingIds = existingEquipment.map(eq => eq.equipmentId);
    
    for (let i = 0; i < bulkData.count; i++) {
      const number = bulkData.startNumber + i;
      const equipmentId = `${prefix}${number.toString().padStart(3, '0')}`;
      
      if (existingIds.includes(equipmentId)) {
        warnings.push(equipmentId);
      }
    }
    
    setDuplicateWarnings(warnings);
    return warnings.length === 0;
  };

  const findNextAvailableStart = () => {
    const existingNumbers = existingEquipment
      .map(eq => eq.equipmentId)
      .filter(id => id.startsWith(prefix))
      .map(id => {
        const num = id.replace(prefix, '').replace('-', '');
        return parseInt(num) || 0;
      })
      .sort((a, b) => a - b);

    let nextNumber = 1;
    for (const num of existingNumbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }

    setBulkData(prev => ({ ...prev, startNumber: nextNumber }));
    setDuplicateWarnings([]);
  };

  const handleCreate = () => {
    if (!bulkData.locationId || bulkData.count <= 0) {
      toast.error('Location and valid count are required');
      return;
    }

    if (!checkForDuplicates()) {
      toast.error('Cannot create equipment with duplicate IDs');
      return;
    }

    const newEquipment = [];
    for (let i = 0; i < bulkData.count; i++) {
      const number = bulkData.startNumber + i;
      const equipmentId = `${prefix}${number.toString().padStart(3, '0')}`;
      const equipmentName = generateEquipmentName(equipmentId);

      newEquipment.push({
        equipmentId,
        name: equipmentName,
        typeId: equipmentType.id,
        locationId: bulkData.locationId,
        status: 'available' as const,
        location_type: 'storage'
      });
    }

    onBulkCreate(newEquipment);
    onClose();
    
    setBulkData({
      count: 5,
      startNumber: bulkData.startNumber + bulkData.count,
      locationId: bulkData.locationId,
    });
    setDuplicateWarnings([]);
  };

  React.useEffect(() => {
    if (isOpen && !bulkData.locationId) {
      const defaultLocation = storageLocations.find(loc => loc.isDefault);
      setBulkData(prev => ({
        ...prev,
        locationId: defaultLocation?.id || storageLocations[0]?.id || ''
      }));
    }
  }, [isOpen, storageLocations, bulkData.locationId]);

  React.useEffect(() => {
    checkForDuplicates();
  }, [bulkData.startNumber, bulkData.count]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Create {equipmentType.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="count">Number of Items</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="50"
              value={bulkData.count}
              onChange={(e) => setBulkData(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
            />
          </div>

          <div>
            <Label htmlFor="startNumber">Starting Number</Label>
            <div className="flex gap-2">
              <Input
                id="startNumber"
                type="number"
                min="1"
                value={bulkData.startNumber}
                onChange={(e) => setBulkData(prev => ({ ...prev, startNumber: parseInt(e.target.value) || 1 }))}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={findNextAvailableStart}
              >
                Find Next
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Will create: {prefix}{bulkData.startNumber.toString().padStart(3, '0')} to {prefix}{(bulkData.startNumber + bulkData.count - 1).toString().padStart(3, '0')}
            </p>
          </div>

          <div>
            <Label htmlFor="location">Storage Location</Label>
            <Select value={bulkData.locationId} onValueChange={(value) => setBulkData(prev => ({ ...prev, locationId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {storageLocations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name} {location.isDefault && '(Default)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {duplicateWarnings.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Duplicate IDs Found</span>
              </div>
              <div className="text-sm text-red-700">
                The following IDs already exist: {duplicateWarnings.join(', ')}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={duplicateWarnings.length > 0 || !bulkData.locationId}
            >
              Create {bulkData.count} Items
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkEquipmentCreationDialog;
