
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { EquipmentType } from '@/types/inventory';

interface EquipmentTypeFormProps {
  editingType: EquipmentType | null;
  onSubmit: (formData: {
    name: string;
    category: EquipmentType['category'];
    description: string;
    requiresIndividualTracking: boolean;
    defaultIdPrefix: string;
  }) => void;
  onCancel: () => void;
}

const EquipmentTypeForm: React.FC<EquipmentTypeFormProps> = ({
  editingType,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'other' as EquipmentType['category'],
    description: '',
    requiresIndividualTracking: false,
    defaultIdPrefix: '',
  });

  useEffect(() => {
    if (editingType) {
      setFormData({
        name: editingType.name,
        category: editingType.category,
        description: editingType.description || '',
        requiresIndividualTracking: editingType.requiresIndividualTracking,
        defaultIdPrefix: editingType.defaultIdPrefix || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'other',
        description: '',
        requiresIndividualTracking: false,
        defaultIdPrefix: '',
      });
    }
  }, [editingType]);

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  return (
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
        <Button onClick={handleSubmit} className="flex-1">
          {editingType ? 'Update' : 'Add'}
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default EquipmentTypeForm;
