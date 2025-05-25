
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, Clock } from 'lucide-react';
import { StorageLocation } from '@/types/inventory';

interface IndividualEquipmentFormProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingEquipment: any;
  formData: {
    equipmentId: string;
    name: string;
    locationId: string;
    serialNumber: string;
    notes: string;
  };
  setFormData: (data: any) => void;
  storageLocations: StorageLocation[];
  onSubmit: (saveImmediate?: boolean) => void;
  onAddItemClick: () => void;
}

const IndividualEquipmentForm: React.FC<IndividualEquipmentFormProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  editingEquipment,
  formData,
  setFormData,
  storageLocations,
  onSubmit,
  onAddItemClick,
}) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" onClick={onAddItemClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingEquipment ? 'Edit Equipment' : 'Add Equipment'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Equipment ID</Label>
            <Input
              value={formData.equipmentId}
              onChange={(e) => setFormData({...formData, equipmentId: e.target.value})}
              placeholder="e.g., SS-001, SL-002"
            />
          </div>
          <div>
            <Label>Equipment Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., ShearStream Alpha, Starlink Unit 1"
            />
          </div>
          <div>
            <Label>Location</Label>
            <Select value={formData.locationId} onValueChange={(value) => setFormData({...formData, locationId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {storageLocations.map(location => (
                  <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Serial Number (Optional)</Label>
            <Input
              value={formData.serialNumber}
              onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
              placeholder="Equipment serial number"
            />
          </div>
          <div>
            <Label>Notes (Optional)</Label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => onSubmit(false)} variant="outline" className="flex-1">
              <Clock className="mr-2 h-4 w-4" />
              {editingEquipment ? 'Update' : 'Add to Drafts'}
            </Button>
            <Button onClick={() => onSubmit(true)} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              {editingEquipment ? 'Update' : 'Add & Save Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IndividualEquipmentForm;
