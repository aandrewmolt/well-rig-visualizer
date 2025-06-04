
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, MapPin, Trash2, Edit } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { toast } from 'sonner';

const StorageLocationManager = () => {
  const { data, createStorageLocation, updateStorageLocation, deleteStorageLocation } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    isDefault: false,
  });

  const filteredLocations = data.storageLocations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (location.address && location.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (location: any) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address || '',
      isDefault: location.isDefault,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (location: any) => {
    try {
      const result = await deleteStorageLocation(location.id);
      if (result) {
        toast.success('Storage location deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete storage location');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Location name is required');
      return;
    }

    try {
      if (editingLocation) {
        await updateStorageLocation(editingLocation.id, formData);
        toast.success('Storage location updated successfully');
      } else {
        await createStorageLocation(formData);
        toast.success('Storage location created successfully');
      }
      resetForm();
    } catch (error) {
      toast.error('Failed to save storage location');
    }
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

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            Storage Locations ({filteredLocations.length})
          </CardTitle>
          
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
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter location name"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter address (optional)"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                  />
                  <Label htmlFor="isDefault">Set as default location</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSubmit}>
                    {editingLocation ? 'Update' : 'Create'} Location
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="relative">
          <Input
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLocations.map((location) => (
            <Card key={location.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-sm flex items-center gap-2">
                      {location.name}
                      {location.isDefault && (
                        <Badge variant="outline" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </h3>
                    {location.address && (
                      <p className="text-xs text-gray-600 mt-1">{location.address}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(location)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Storage Location</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{location.name}"? This action cannot be undone.
                            {location.isDefault && (
                              <span className="block mt-2 text-amber-600 font-medium">
                                Warning: This is your default location.
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(location)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredLocations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No storage locations found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StorageLocationManager;
