import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { toast } from 'sonner';
import EquipmentListFilters from './EquipmentListFilters';
import EquipmentFormDialog from './EquipmentFormDialog';
import EquipmentTable from './EquipmentTable';

const EquipmentListView = () => {
  const { data, updateSingleEquipmentItem, addEquipmentItem, deleteEquipmentItem } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    typeId: '',
    locationId: '',
    quantity: 1,
    status: 'available' as const,
    notes: ''
  });

  const getEquipmentTypeName = (typeId: string) => {
    const type = data.equipmentTypes.find(t => t.id === typeId);
    return type?.name || 'Unknown Type';
  };

  const getEquipmentTypeCategory = (typeId: string) => {
    const type = data.equipmentTypes.find(t => t.id === typeId);
    return type?.category || 'other';
  };

  const getLocationName = (locationId: string) => {
    const location = data.storageLocations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'deployed':
        return 'bg-blue-100 text-blue-800';
      case 'red-tagged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cables':
        return 'bg-blue-100 text-blue-800';
      case 'gauges':
        return 'bg-green-100 text-green-800';
      case 'adapters':
        return 'bg-yellow-100 text-yellow-800';
      case 'communication':
        return 'bg-purple-100 text-purple-800';
      case 'power':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEquipment = data.equipmentItems.filter(item => {
    const typeName = getEquipmentTypeName(item.typeId).toLowerCase();
    const typeCategory = getEquipmentTypeCategory(item.typeId);
    const locationName = getLocationName(item.locationId).toLowerCase();
    const matchesSearch = typeName.includes(searchTerm.toLowerCase()) || 
                         locationName.includes(searchTerm.toLowerCase()) ||
                         (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesLocation = filterLocation === 'all' || item.locationId === filterLocation;
    const matchesCategory = filterCategory === 'all' || typeCategory === filterCategory;
    
    return matchesSearch && matchesStatus && matchesLocation && matchesCategory;
  });

  const handleStatusChange = (itemId: string, newStatus: 'available' | 'deployed' | 'red-tagged') => {
    updateSingleEquipmentItem(itemId, { status: newStatus });
    toast.success('Equipment status updated successfully');
  };

  const handleDelete = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this equipment item?')) {
      try {
        await deleteEquipmentItem(itemId);
        toast.success('Equipment item deleted successfully');
      } catch (error) {
        toast.error('Failed to delete equipment item');
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.typeId || !formData.locationId) {
      toast.error('Please select equipment type and location');
      return;
    }

    try {
      if (editingItem) {
        updateSingleEquipmentItem(editingItem.id, formData);
        toast.success('Equipment updated successfully');
      } else {
        addEquipmentItem(formData);
        toast.success('Equipment added successfully');
      }
      resetForm();
    } catch (error) {
      toast.error('Failed to save equipment');
    }
  };

  const resetForm = () => {
    setFormData({
      typeId: '',
      locationId: '',
      quantity: 1,
      status: 'available',
      notes: ''
    });
    setEditingItem(null);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      typeId: item.typeId,
      locationId: item.locationId,
      quantity: item.quantity,
      status: item.status,
      notes: item.notes || ''
    });
    setIsAddDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterLocation('all');
    setFilterCategory('all');
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Equipment List ({filteredEquipment.length} items)
          </CardTitle>
          
          <div className="flex gap-2">
            <Button onClick={() => {
              setEditingItem(null);
              setIsAddDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
            </Button>
          </div>
        </div>
        
        <EquipmentListFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterLocation={filterLocation}
          setFilterLocation={setFilterLocation}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          data={data}
          onClearFilters={clearFilters}
          getCategoryColor={getCategoryColor}
        />
      </CardHeader>
      
      <CardContent>
        <EquipmentTable
          filteredEquipment={filteredEquipment}
          data={data}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          getEquipmentTypeName={getEquipmentTypeName}
          getEquipmentTypeCategory={getEquipmentTypeCategory}
          getLocationName={getLocationName}
          getStatusColor={getStatusColor}
          getCategoryColor={getCategoryColor}
          onClearFilters={clearFilters}
        />
        
        <EquipmentFormDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          editingItem={editingItem}
          formData={formData}
          setFormData={setFormData}
          data={data}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          getCategoryColor={getCategoryColor}
        />
      </CardContent>
    </Card>
  );
};

export default EquipmentListView;
