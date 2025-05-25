
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useInventoryData, EquipmentType } from '@/hooks/useInventoryData';
import { toast } from 'sonner';

const EquipmentTypeManager = () => {
  const { data, updateEquipmentTypes } = useInventoryData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<EquipmentType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'cables' as EquipmentType['category'],
    description: ''
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Equipment name is required');
      return;
    }

    if (editingType) {
      // Update existing type
      const updatedTypes = data.equipmentTypes.map(type =>
        type.id === editingType.id
          ? { ...type, ...formData }
          : type
      );
      updateEquipmentTypes(updatedTypes);
      toast.success('Equipment type updated successfully');
    } else {
      // Add new type
      const newType: EquipmentType = {
        id: Date.now().toString(),
        ...formData
      };
      updateEquipmentTypes([...data.equipmentTypes, newType]);
      toast.success('Equipment type added successfully');
    }

    resetForm();
  };

  const handleEdit = (type: EquipmentType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      category: type.category,
      description: type.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (typeId: string) => {
    // Check if any equipment items use this type
    const hasItems = data.equipmentItems.some(item => item.typeId === typeId);
    if (hasItems) {
      toast.error('Cannot delete equipment type that has inventory items');
      return;
    }

    const updatedTypes = data.equipmentTypes.filter(type => type.id !== typeId);
    updateEquipmentTypes(updatedTypes);
    toast.success('Equipment type deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'cables',
      description: ''
    });
    setEditingType(null);
    setIsDialogOpen(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cables': return 'bg-blue-100 text-blue-800';
      case 'gauges': return 'bg-green-100 text-green-800';
      case 'adapters': return 'bg-purple-100 text-purple-800';
      case 'communication': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {types.map(type => {
                  const itemCount = data.equipmentItems
                    .filter(item => item.typeId === type.id)
                    .reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <div key={type.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-lg">{type.name}</h3>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(type)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(type.id)}
                            disabled={itemCount > 0}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {type.description && (
                        <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge className={getCategoryColor(type.category)}>
                          {type.category}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {itemCount} items
                        </span>
                      </div>
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
