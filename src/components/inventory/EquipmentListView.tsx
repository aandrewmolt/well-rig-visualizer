
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Package, Plus, Edit, Trash2 } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { toast } from 'sonner';

const EquipmentListView = () => {
  const { data, updateSingleEquipmentItem, addEquipmentItem, deleteEquipmentItem } = useSupabaseInventory();
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

  // Get unique categories for filter
  const availableCategories = [...new Set(data.equipmentTypes.map(type => type.category))];

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
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingItem(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Equipment
              </Button>
            </DialogTrigger>
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
                      {data.equipmentTypes.map(type => (
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
                      {data.storageLocations.map(location => (
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
                  <Button onClick={handleSubmit} className="flex-1">
                    {editingItem ? 'Update' : 'Add'}
                  </Button>
                  <Button onClick={resetForm} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search equipment, location, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {availableCategories.map(category => (
                <SelectItem key={category} value={category}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getCategoryColor(category)}>
                      {category}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="deployed">Deployed</SelectItem>
              <SelectItem value="red-tagged">Red Tagged</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {data.storageLocations.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={clearFilters} variant="outline">
            Clear Filters
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Job ID</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipment.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {getEquipmentTypeName(item.typeId)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCategoryColor(getEquipmentTypeCategory(item.typeId))}>
                      {getEquipmentTypeCategory(item.typeId)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getLocationName(item.locationId)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.jobId || '-'}</TableCell>
                  <TableCell className="max-w-32 truncate">
                    {item.notes || '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleEdit(item)}
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(item.id)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <Select
                        value={item.status}
                        onValueChange={(value: 'available' | 'deployed' | 'red-tagged') => 
                          handleStatusChange(item.id, value)
                        }
                      >
                        <SelectTrigger className="h-8 w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="deployed">Deployed</SelectItem>
                          <SelectItem value="red-tagged">Red Tagged</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredEquipment.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No equipment found matching your filters</p>
              <Button onClick={clearFilters} variant="outline" className="mt-2">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentListView;
