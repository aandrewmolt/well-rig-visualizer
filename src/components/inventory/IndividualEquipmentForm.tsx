import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, Clock } from 'lucide-react';
import { StorageLocation, IndividualEquipment, EquipmentType } from '@/types/inventory';

interface IndividualEquipmentFormProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingEquipment: IndividualEquipment | null;
  setEditingEquipment: (equipment: IndividualEquipment) => void;
  formData: {
    equipmentId: string;
    name: string;
    locationId: string;
    serialNumber: string;
    notes: string;
    selectedPrefix?: string;
  };
  setFormData: (data: any) => void;
  equipmentType: EquipmentType;
  storageLocations: StorageLocation[];
  allEquipment: IndividualEquipment[];
  onSubmit: (saveImmediate?: boolean) => void;
  onReset: () => void;
  onPrefixChange?: (prefix: string) => void;
}

const IndividualEquipmentForm: React.FC<IndividualEquipmentFormProps> = ({
  isFormOpen,
  setIsFormOpen,
  editingEquipment,
  formData,
  setFormData,
  equipmentType,
  storageLocations,
  onSubmit,
  onReset,
  onPrefixChange,
}) => {
  const handleAddItemClick = () => {
    if (!editingEquipment) {
      onReset();
    }
    setIsFormOpen(true);
  };

  // Show prefix selector for Customer Computer types
  const showPrefixSelector = equipmentType.name === 'Customer Computer';
  const prefixOptions = showPrefixSelector ? [
    { value: 'CC', label: 'CC - Customer Computer' },
    { value: 'CT', label: 'CT - Customer Tablet' }
  ] : [];

  const handlePrefixSelectionChange = (prefix: string) => {
    if (onPrefixChange) {
      onPrefixChange(prefix);
    }
    setFormData({ ...formData, selectedPrefix: prefix });
  };

  const handleSubmitWithSaving = async (saveImmediate: boolean) => {
    try {
      await onSubmit(saveImmediate);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <DialogTrigger asChild>
        <Button size="sm" onClick={handleAddItemClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingEquipment ? 'Edit Equipment' : `Add ${equipmentType.name}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {showPrefixSelector && !editingEquipment && (
            <div>
              <Label>Device Type</Label>
              <Select 
                value={formData.selectedPrefix || 'CC'} 
                onValueChange={handlePrefixSelectionChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  {prefixOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <Label>Equipment ID</Label>
            <Input
              value={formData.equipmentId}
              onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
              placeholder="Auto-generated ID"
              disabled={!editingEquipment}
            />
          </div>
          
          <div>
            <Label>Equipment Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Equipment display name"
            />
          </div>
          
          <div>
            <Label>Location *</Label>
            <Select 
              value={formData.locationId} 
              onValueChange={(value) => setFormData({ ...formData, locationId: value })}
            >
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
            <Label>Serial Number (Optional)</Label>
            <Input
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="Equipment serial number"
            />
          </div>
          
          <div>
            <Label>Notes (Optional)</Label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
            />
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button 
              onClick={() => handleSubmitWithSaving(false)} 
              variant="outline" 
              className="flex-1"
              disabled={!formData.equipmentId || !formData.name || !formData.locationId}
            >
              <Clock className="mr-2 h-4 w-4" />
              {editingEquipment ? 'Update' : 'Add to Drafts'}
            </Button>
            <Button 
              onClick={() => handleSubmitWithSaving(true)} 
              className="flex-1"
              disabled={!formData.equipmentId || !formData.name || !formData.locationId}
            >
              <Save className="mr-2 h-4 w-4" />
              {editingEquipment ? 'Update' : 'Save Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IndividualEquipmentForm;
