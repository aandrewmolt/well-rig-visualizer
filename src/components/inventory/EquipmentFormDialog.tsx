
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { InventoryData } from '@/types/inventory';

interface EquipmentFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: any;
  formData: {
    typeId: string;
    locationId: string;
    quantity: number;
    status: 'available' | 'deployed' | 'red-tagged';
    notes: string;
  };
  setFormData: (data: any) => void;
  data: InventoryData;
  onSubmit: () => void;
  onCancel: () => void;
  getCategoryColor: (category: string) => string;
}

const EquipmentFormDialog: React.FC<EquipmentFormDialogProps> = ({
  isOpen,
  onOpenChange,
  editingItem,
  formData,
  setFormData,
  data,
  onSubmit,
  onCancel,
  getCategoryColor,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Edit Equipment' : 'Add Equipment'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Equipment Type</Label>
            <Select value={formData.typeId} onValueChange={(value) => setFormData({...formData, typeId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select equipment type" />
              </SelectTrigger>
              <SelectContent>
                {data.equipmentTypes.filter(type => type.id && type.id.trim() !== '').map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      {type.name}
                      <Badge variant="outline" className={getCategoryColor(type.category)}>
                        {type.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Location</Label>
            <Select value={formData.locationId} onValueChange={(value) => setFormData({...formData, locationId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {data.storageLocations.filter(location => location.id && location.id.trim() !== '').map(location => (
                  <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
              min="1"
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="deployed">Deployed</SelectItem>
                <SelectItem value="red-tagged">Red Tagged</SelectItem>
              </SelectContent>
            </Select>
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
            <Button onClick={onSubmit} className="flex-1">
              {editingItem ? 'Update' : 'Add'}
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentFormDialog;
