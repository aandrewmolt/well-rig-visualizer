
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash, MapPin } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { StorageLocation } from '@/types/inventory';
import { toast } from 'sonner';

const StorageLocationManager = () => {
  const { data } = useSupabaseInventory();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StorageLocation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    isDefault: false,
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Location name is required');
      return;
    }

    // TODO: Implement create/update storage location
    console.log('Creating/updating storage location:', formData);
    toast.success(editingLocation ? 'Storage location updated' : 'Storage location created');
    resetForm();
  };

  const handleEdit = (location: StorageLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address || '',
      isDefault: location.isDefault,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (locationId: string) => {
    // TODO: Implement delete storage location
    console.log('Deleting storage location:', locationId);
    toast.success('Storage location deleted');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      isDefault: false,
    });
    setEditingLocation(null);
    setIsDialogOpen(false);
  };

  const getLocationStats = (locationId: string) => {
    const bulkItems = data.equipmentItems.filter(item => item.locationId === locationId);
    const individualItems = data.individualEquipment.filter(eq => eq.locationId === locationId);
    
    return {
      bulkCount: bulkItems.reduce((sum, item) => sum + item.quantity, 0),
      individualCount: individualItems.length,
      totalTypes: new Set([
        ...bulkItems.map(item => item.typeId),
        ...individualItems.map(eq => eq.typeId)
      ]).size
    };
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
                <Switch
                  id="is-default"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                />
                <Label htmlFor="is-default" className="text-sm font-medium">
                  Set as default location
                </Label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.storageLocations.map(location => {
          const stats = getLocationStats(location.id);
          
          return (
            <Card key={location.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {location.name}
                  </CardTitle>
                  {location.isDefault && (
                    <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                  )}
                </div>
                {location.address && (
                  <p className="text-sm text-gray-600">{location.address}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{stats.bulkCount}</p>
                      <p className="text-xs text-gray-600">Bulk Items</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{stats.individualCount}</p>
                      <p className="text-xs text-gray-600">Individual Items</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-700">{stats.totalTypes}</p>
                    <p className="text-xs text-gray-600">Equipment Types</p>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleEdit(location)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(location.id)}
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <Trash className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
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
