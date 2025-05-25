
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { useInventoryData, StorageLocation } from '@/hooks/useInventoryData';
import { toast } from 'sonner';

const StorageLocationManager = () => {
  const { data, updateStorageLocations } = useInventoryData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StorageLocation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    isDefault: false
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Location name is required');
      return;
    }

    let updatedLocations: StorageLocation[];

    if (editingLocation) {
      // Update existing location
      updatedLocations = data.storageLocations.map(location =>
        location.id === editingLocation.id
          ? { ...location, ...formData }
          : location
      );
    } else {
      // Add new location
      const newLocation: StorageLocation = {
        id: Date.now().toString(),
        ...formData
      };
      updatedLocations = [...data.storageLocations, newLocation];
    }

    // Ensure only one default location
    if (formData.isDefault) {
      updatedLocations = updatedLocations.map(location => ({
        ...location,
        isDefault: location.id === (editingLocation?.id || updatedLocations[updatedLocations.length - 1].id)
      }));
    }

    updateStorageLocations(updatedLocations);
    toast.success(editingLocation ? 'Location updated successfully' : 'Location added successfully');
    resetForm();
  };

  const handleEdit = (location: StorageLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address || '',
      isDefault: location.isDefault
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (locationId: string) => {
    // Check if any equipment items are at this location
    const hasItems = data.equipmentItems.some(item => item.locationId === locationId);
    if (hasItems) {
      toast.error('Cannot delete location that has equipment');
      return;
    }

    // Prevent deleting the default location if it's the only one
    const location = data.storageLocations.find(loc => loc.id === locationId);
    if (location?.isDefault && data.storageLocations.length === 1) {
      toast.error('Cannot delete the only location');
      return;
    }

    let updatedLocations = data.storageLocations.filter(loc => loc.id !== locationId);

    // If we deleted the default location, make the first remaining location default
    if (location?.isDefault && updatedLocations.length > 0) {
      updatedLocations[0].isDefault = true;
    }

    updateStorageLocations(updatedLocations);
    toast.success('Location deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      isDefault: false
    });
    setEditingLocation(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Storage Locations</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingLocation(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? 'Edit Storage Location' : 'Add Storage Location'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter location name..."
                />
              </div>
              <div>
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter address..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked as boolean })}
                />
                <Label htmlFor="isDefault">Set as default location</Label>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingLocation ? 'Update' : 'Add'}
                </Button>
                <Button onClick={resetForm} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.storageLocations.map(location => {
          const equipmentCount = data.equipmentItems
            .filter(item => item.locationId === location.id)
            .reduce((sum, item) => sum + item.quantity, 0);

          const availableCount = data.equipmentItems
            .filter(item => item.locationId === location.id && item.status === 'available')
            .reduce((sum, item) => sum + item.quantity, 0);

          return (
            <Card key={location.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-gray-500" />
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(location)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(location.id)}
                      disabled={equipmentCount > 0}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {location.isDefault && (
                  <Badge variant="secondary" className="w-fit">
                    Default Location
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                {location.address && (
                  <p className="text-sm text-gray-600 mb-3">{location.address}</p>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Equipment:</span>
                    <span className="font-medium">{equipmentCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Available:</span>
                    <span className="font-medium text-green-600">{availableCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Deployed:</span>
                    <span className="font-medium text-orange-600">
                      {data.equipmentItems
                        .filter(item => item.locationId === location.id && item.status === 'deployed')
                        .reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Red Tagged:</span>
                    <span className="font-medium text-red-600">
                      {data.equipmentItems
                        .filter(item => item.locationId === location.id && item.status === 'red-tagged')
                        .reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StorageLocationManager;
