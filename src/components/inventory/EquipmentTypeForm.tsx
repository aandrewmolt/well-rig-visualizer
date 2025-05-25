
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { EquipmentType } from '@/types/inventory';

interface EquipmentTypeFormProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingType: EquipmentType | null;
  setEditingType: (type: EquipmentType | null) => void;
  formData: {
    name: string;
    category: EquipmentType['category'];
    description: string;
    requiresIndividualTracking: boolean;
    defaultIdPrefix: string;
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onReset: () => void;
}

const EquipmentTypeForm: React.FC<EquipmentTypeFormProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  editingType,
  setEditingType,
  formData,
  setFormData,
  onSubmit,
  onReset,
}) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setEditingType(null)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Equipment Type
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingType ? 'Edit Equipment Type' : 'Add Equipment Type'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Equipment Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter equipment name..."
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cables">Cables</SelectItem>
                <SelectItem value="gauges">Gauges</SelectItem>
                <SelectItem value="adapters">Adapters</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description..."
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="individual-tracking"
                checked={formData.requiresIndividualTracking}
                onCheckedChange={(checked) => setFormData({ ...formData, requiresIndividualTracking: checked })}
              />
              <Label htmlFor="individual-tracking" className="text-sm font-medium">
                Requires Individual Tracking
              </Label>
            </div>
            <p className="text-xs text-gray-600">
              Enable this for equipment that needs individual IDs/names (e.g., SS-001, SL-002)
            </p>
            {formData.requiresIndividualTracking && (
              <div>
                <Label htmlFor="prefix">Default ID Prefix</Label>
                <Input
                  id="prefix"
                  value={formData.defaultIdPrefix}
                  onChange={(e) => setFormData({ ...formData, defaultIdPrefix: e.target.value })}
                  placeholder="e.g., SS-, SL-, CC-"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used to auto-generate IDs like {formData.defaultIdPrefix}001
                </p>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button onClick={onSubmit} className="flex-1">
              {editingType ? 'Update' : 'Add'}
            </Button>
            <Button onClick={onReset} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentTypeForm;
