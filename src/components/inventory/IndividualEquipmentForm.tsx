
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { EquipmentType, StorageLocation } from '@/types/inventory';

interface IndividualEquipmentFormProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingEquipment: any;
  setEditingEquipment: (equipment: any) => void;
  formData: {
    equipmentId: string;
    name: string;
    locationId: string;
    serialNumber: string;
    notes: string;
    selectedPrefix: string;
  };
  setFormData: (data: any) => void;
  equipmentType: EquipmentType;
  storageLocations: StorageLocation[];
  allEquipment: any[];
  onSubmit: (saveImmediate?: boolean) => void;
  onReset: () => void;
  onPrefixChange: (prefix: string) => void;
}

const IndividualEquipmentForm: React.FC<IndividualEquipmentFormProps> = ({
  isFormOpen,
  setIsFormOpen,
  editingEquipment,
  setEditingEquipment,
  formData,
  setFormData,
  equipmentType,
  storageLocations,
  allEquipment,
  onSubmit,
  onReset,
  onPrefixChange,
}) => {
  const prefixOptions = ['CC', 'CT', 'SL', 'PG', 'BP', equipmentType.defaultIdPrefix].filter(Boolean);

  const handleCancel = () => {
    onReset();
    setIsFormOpen(false);
  };

  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-3 w-3 mr-1" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingEquipment ? 'Edit' : 'Add'} {equipmentType.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="prefix">ID Prefix</Label>
            <Select value={formData.selectedPrefix} onValueChange={onPrefixChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {prefixOptions.map(prefix => (
                  <SelectItem key={prefix} value={prefix}>
                    {prefix}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="equipmentId">Equipment ID</Label>
            <Input
              value={formData.equipmentId}
              onChange={(e) => setFormData(prev => ({ ...prev, equipmentId: e.target.value }))}
              placeholder="e.g., SS0001, CC01, SL01"
            />
          </div>

          <div>
            <Label htmlFor="name">Equipment Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., ShearStream-0001, Customer Computer 01, Starlink-01"
            />
          </div>

          <div>
            <Label htmlFor="locationId">Location *</Label>
            <Select value={formData.locationId} onValueChange={(value) => setFormData(prev => ({ ...prev, locationId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {storageLocations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              value={formData.serialNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
              placeholder="Optional"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex gap-2">
            {editingEquipment ? (
              <>
                <Button onClick={() => onSubmit(true)}>
                  Update Equipment
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => onSubmit(false)}>
                  Add to Draft
                </Button>
                <Button variant="outline" onClick={() => onSubmit(true)}>
                  Save Immediately
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IndividualEquipmentForm;
