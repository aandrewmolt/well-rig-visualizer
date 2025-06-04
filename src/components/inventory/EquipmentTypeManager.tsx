
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { EquipmentType } from '@/types/inventory';
import EquipmentTypeForm from './EquipmentTypeForm';
import IndividualEquipmentManager from './IndividualEquipmentManager';

const EquipmentTypeManager = () => {
  const { data, createEquipmentType, updateEquipmentType, deleteEquipmentType } = useSupabaseInventory();
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
      return;
    }

    if (editingType) {
      updateEquipmentType(editingType.id, formData);
    } else {
      createEquipmentType(formData);
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
      defaultIdPrefix: type.defaultIdPrefix || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (typeId: string) => {
    // Check if any equipment items use this type
    const hasItems = data.equipmentItems.some(item => item.typeId === typeId);
    const hasIndividualItems = data.individualEquipment.some(eq => eq.typeId === typeId);
    
    if (hasItems || hasIndividualItems) {
      return;
    }
    
    deleteEquipmentType(typeId);
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
        <EquipmentTypeForm
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          editingType={editingType}
          setEditingType={setEditingType}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />
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
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(type.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
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
