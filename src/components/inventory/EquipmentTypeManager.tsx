
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash, Package } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import IndividualEquipmentManager from './IndividualEquipmentManager';
import { EquipmentType } from '@/types/inventory';
import { toast } from 'sonner';

const EquipmentTypeManager = () => {
  const { data } = useSupabaseInventory();
  const [selectedTypeForDetails, setSelectedTypeForDetails] = useState<EquipmentType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<EquipmentType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'other' as EquipmentType['category'],
    description: '',
    requiresIndividualTracking: false,
    defaultIdPrefix: '',
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cables': return 'bg-blue-100 text-blue-800';
      case 'gauges': return 'bg-green-100 text-green-800';
      case 'adapters': return 'bg-purple-100 text-purple-800';
      case 'communication': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Equipment name is required');
      return;
    }

    // TODO: Implement create/update equipment type
    console.log('Creating/updating equipment type:', formData);
    toast.success(editingType ? 'Equipment type updated' : 'Equipment type created');
    resetForm();
  };

  const handleEdit = (type: EquipmentType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      category: type.category,
      description: type.description || '',
      requiresIndividualTracking: type.requiresIndividualTracking,
      defaultIdPrefix: type.defaultIdPrefix || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (typeId: string) => {
    // TODO: Implement delete equipment type
    console.log('Deleting equipment type:', typeId);
    toast.success('Equipment type deleted');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'other',
      description: '',
      requiresIndividualTracking: false,
      defaultIdPrefix: '',
    });
    setEditingType(null);
    setIsDialogOpen(false);
  };

  const groupedTypes = data.equipmentTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, EquipmentType[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Equipment Types</h2>
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
                <Button onClick={handleSubmit} className="flex-1">
                  {editingType ? 'Update' : 'Add'}
                </Button>
                <Button onClick={resetForm} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTypes).map(([category, types]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize flex items-center">
                {category}
                <Badge className={`ml-2 ${getCategoryColor(category)}`}>
                  {types.length} types
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                {types.map(type => {
                  const typeItems = data.equipmentItems.filter(item => item.typeId === type.id);
                  const individualItems = data.individualEquipment.filter(eq => eq.typeId === type.id);

                  return (
                    <div key={type.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{type.name}</h3>
                          {type.description && (
                            <p className="text-sm text-gray-600">{type.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline">
                              {typeItems.reduce((sum, item) => sum + item.quantity, 0)} bulk items
                            </Badge>
                            <Badge variant="outline">
                              {individualItems.length} individual items
                            </Badge>
                            {type.requiresIndividualTracking && (
                              <Badge className="bg-blue-100 text-blue-800">
                                Individual Tracking
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(type)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(type.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => setSelectedTypeForDetails(
                              selectedTypeForDetails?.id === type.id ? null : type
                            )}
                            size="sm"
                            variant={selectedTypeForDetails?.id === type.id ? "default" : "outline"}
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {selectedTypeForDetails?.id === type.id && type.requiresIndividualTracking && (
                        <IndividualEquipmentManager
                          equipmentType={type}
                          storageLocations={data.storageLocations}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EquipmentTypeManager;
