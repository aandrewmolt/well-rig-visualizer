import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Settings, Trash2, Edit } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { toast } from 'sonner';
import EquipmentTypeForm from './EquipmentTypeForm';

const EquipmentTypeManager = () => {
  const { data, createEquipmentType, updateEquipmentTypes, deleteEquipmentType } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);

  const filteredTypes = data.equipmentTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cables': return 'bg-blue-100 text-blue-800';
      case 'gauges': return 'bg-green-100 text-green-800';
      case 'adapters': return 'bg-yellow-100 text-yellow-800';
      case 'communication': return 'bg-purple-100 text-purple-800';
      case 'power': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (type: any) => {
    setEditingType(type);
    setIsDialogOpen(true);
  };

  const handleDelete = async (typeId: string) => {
    if (window.confirm('Are you sure you want to delete this equipment type?')) {
      try {
        await deleteEquipmentType(typeId);
        toast.success('Equipment type deleted successfully');
      } catch (error) {
        toast.error('Failed to delete equipment type');
      }
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingType) {
        await updateEquipmentTypes(editingType.id, formData);
        toast.success('Equipment type updated successfully');
      } else {
        await createEquipmentType(formData);
        toast.success('Equipment type created successfully');
      }
      setIsDialogOpen(false);
      setEditingType(null);
    } catch (error) {
      toast.error('Failed to save equipment type');
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingType(null);
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Equipment Types ({filteredTypes.length})
          </CardTitle>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingType(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingType ? 'Edit Equipment Type' : 'Add Equipment Type'}
                </DialogTitle>
              </DialogHeader>
              <EquipmentTypeForm
                editingType={editingType}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="relative">
          <Input
            placeholder="Search equipment types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTypes.map((type) => (
            <Card key={type.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm">{type.name}</h3>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(type)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(type.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Badge className={getCategoryColor(type.category)}>
                    {type.category}
                  </Badge>
                  
                  {type.description && (
                    <p className="text-xs text-gray-600">{type.description}</p>
                  )}
                  
                  {type.defaultIdPrefix && (
                    <div className="text-xs text-gray-500">
                      Prefix: {type.defaultIdPrefix}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Individual Tracking: {type.requiresIndividualTracking ? 'Yes' : 'No'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredTypes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No equipment types found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentTypeManager;
