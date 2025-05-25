
import React, { useState, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, Package, Settings } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { EquipmentType } from '@/types/inventory';
import { toast } from 'sonner';
import EquipmentQuantityEditor from './EquipmentQuantityEditor';
import IndividualEquipmentManager from './IndividualEquipmentManager';

// Context to share draft counts between components
const DraftCountContext = createContext<{ [typeId: string]: number }>({});

const EquipmentTypeManager = () => {
  const { data, updateEquipmentTypes } = useInventoryData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<EquipmentType | null>(null);
  const [selectedTypeForDetails, setSelectedTypeForDetails] = useState<EquipmentType | null>(null);
  const [draftCounts, setDraftCounts] = useState<{ [typeId: string]: number }>({});
  const [formData, setFormData] = useState({
    name: '',
    category: 'cables' as EquipmentType['category'],
    description: '',
    requiresIndividualTracking: false,
    defaultIdPrefix: ''
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
      // Add new type - show tracking prompt
      if (formData.requiresIndividualTracking && !formData.defaultIdPrefix.trim()) {
        toast.error('Please provide a default ID prefix for individually tracked equipment');
        return;
      }

      const newType: EquipmentType = {
        id: Date.now().toString(),
        ...formData
      };
      updateEquipmentTypes([...data.equipmentTypes, newType]);
      
      if (formData.requiresIndividualTracking) {
        toast.success(`Equipment type added with individual tracking enabled (prefix: ${formData.defaultIdPrefix})`);
      } else {
        toast.success('Equipment type added successfully');
      }
    }

    resetForm();
  };

  const handleEdit = (type: EquipmentType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      category: type.category,
      description: type.description || '',
      requiresIndividualTracking: type.requiresIndividualTracking,
      defaultIdPrefix: type.defaultIdPrefix || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (typeId: string) => {
    // Check if any equipment items use this type
    const hasItems = data.equipmentItems.some(item => item.typeId === typeId);
    const hasIndividualItems = data.individualEquipment.some(eq => eq.typeId === typeId);
    
    if (hasItems || hasIndividualItems) {
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
      description: '',
      requiresIndividualTracking: false,
      defaultIdPrefix: ''
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

  const updateDraftCount = (typeId: string, count: number) => {
    console.log('Updating draft count for type', typeId, 'to', count);
    setDraftCounts(prev => ({ ...prev, [typeId]: count }));
  };

  const groupedTypes = data.equipmentTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, EquipmentType[]>);

  return (
    <DraftCountContext.Provider value={draftCounts}>
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
                    const itemCount = typeItems.reduce((sum, item) => sum + item.quantity, 0);
                    const draftCount = draftCounts[type.id] || 0;
                    const totalIndividualCount = individualItems.length + draftCount;

                    return (
                      <div key={type.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-lg flex items-center gap-2">
                              {type.name}
                              {type.requiresIndividualTracking && (
                                <Badge variant="outline" className="text-xs">
                                  <Package className="h-3 w-3 mr-1" />
                                  Individual Tracking
                                </Badge>
                              )}
                            </h3>
                            {type.description && (
                              <p className="text-sm text-gray-600">{type.description}</p>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(type)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            {type.requiresIndividualTracking && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedTypeForDetails(selectedTypeForDetails?.id === type.id ? null : type)}
                              >
                                <Settings className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(type.id)}
                              disabled={itemCount > 0 || totalIndividualCount > 0}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={getCategoryColor(type.category)}>
                            {type.category}
                          </Badge>
                          <div className="text-sm font-medium text-gray-700">
                            {type.requiresIndividualTracking ? (
                              <span>
                                {individualItems.length} saved
                                {draftCount > 0 && (
                                  <span className="text-orange-600"> + {draftCount} draft</span>
                                )}
                                {' = '}
                                <span className="font-bold">{totalIndividualCount} total items</span>
                              </span>
                            ) : (
                              <span>Total: {itemCount} items</span>
                            )}
                          </div>
                        </div>

                        {!type.requiresIndividualTracking && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Manage Quantities:</span>
                              <EquipmentQuantityEditor
                                equipmentTypeId={type.id}
                                equipmentTypeName={type.name}
                                currentItems={typeItems}
                              />
                            </div>
                            
                            {typeItems.length > 0 && (
                              <div className="grid grid-cols-1 gap-1">
                                {typeItems.map(item => (
                                  <div key={item.id} className="flex justify-between text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                    <span>{data.storageLocations.find(loc => loc.id === item.locationId)?.name}</span>
                                    <span className="flex items-center gap-1">
                                      <span className="font-medium">{item.quantity}</span>
                                      <Badge variant={
                                        item.status === 'available' ? 'default' :
                                        item.status === 'deployed' ? 'secondary' : 'destructive'
                                      } className="text-xs px-1 py-0">
                                        {item.status}
                                      </Badge>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {selectedTypeForDetails?.id === type.id && type.requiresIndividualTracking && (
                          <div className="mt-4 border-t pt-4">
                            <IndividualEquipmentManagerWithDraftTracking 
                              equipmentType={type} 
                              onDraftCountChange={(count) => updateDraftCount(type.id, count)}
                            />
                          </div>
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
    </DraftCountContext.Provider>
  );
};

// Wrapper component to track draft counts
const IndividualEquipmentManagerWithDraftTracking: React.FC<{
  equipmentType: EquipmentType;
  onDraftCountChange: (count: number) => void;
}> = ({ equipmentType, onDraftCountChange }) => {
  return (
    <IndividualEquipmentManager 
      equipmentType={equipmentType}
      onDraftCountChange={onDraftCountChange}
    />
  );
};

export default EquipmentTypeManager;
