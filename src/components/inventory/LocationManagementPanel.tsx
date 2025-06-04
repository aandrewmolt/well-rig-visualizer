
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Edit2, Trash2, Building } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { toast } from 'sonner';

const LocationManagementPanel = () => {
  const { data, createStorageLocation, updateStorageLocation, deleteStorageLocation } = useSupabaseInventory();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationAddress, setNewLocationAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleCreateLocation = async () => {
    if (!newLocationName.trim()) {
      toast.error('Location name is required');
      return;
    }

    try {
      createStorageLocation({
        name: newLocationName.trim(),
        address: newLocationAddress.trim() || undefined,
        isDefault: isDefault,
      });
      setIsCreateDialogOpen(false);
      setNewLocationName('');
      setNewLocationAddress('');
      setIsDefault(false);
    } catch (error) {
      console.error('Error creating location:', error);
    }
  };

  const handleEditLocation = (location: any) => {
    setEditingLocation(location);
    setNewLocationName(location.name);
    setNewLocationAddress(location.address || '');
    setIsDefault(location.isDefault);
    setIsEditDialogOpen(true);
  };

  const handleUpdateLocation = async () => {
    if (!newLocationName.trim()) {
      toast.error('Location name is required');
      return;
    }

    if (!editingLocation) return;

    try {
      updateStorageLocation(editingLocation.id, {
        name: newLocationName.trim(),
        address: newLocationAddress.trim() || undefined,
        isDefault: isDefault,
      });
      setIsEditDialogOpen(false);
      setEditingLocation(null);
      setNewLocationName('');
      setNewLocationAddress('');
      setIsDefault(false);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (window.confirm('Are you sure you want to delete this location? This cannot be undone.')) {
      try {
        deleteStorageLocation(locationId);
      } catch (error) {
        console.error('Error deleting location:', error);
      }
    }
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="h-5 w-5" />
            Storage Locations
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Storage Location</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="locationName">Location Name *</Label>
                  <Input
                    id="locationName"
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    placeholder="e.g., Main Warehouse, Field Office A"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="locationAddress">Address (Optional)</Label>
                  <Input
                    id="locationAddress"
                    value={newLocationAddress}
                    onChange={(e) => setNewLocationAddress(e.target.value)}
                    placeholder="Street address, city, state"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                  />
                  <Label htmlFor="isDefault">Set as default location</Label>
                </div>
                <Button onClick={handleCreateLocation} className="w-full">
                  Create Location
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.storageLocations.map(location => (
            <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{location.name}</span>
                  {location.isDefault && (
                    <Badge variant="outline" className="text-xs">Default</Badge>
                  )}
                </div>
                {location.address && (
                  <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleEditLocation(location)}
                  variant="ghost"
                  size="sm"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                {!location.isDefault && (
                  <Button
                    onClick={() => handleDeleteLocation(location.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Storage Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editLocationName">Location Name *</Label>
                <Input
                  id="editLocationName"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder="e.g., Main Warehouse, Field Office A"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editLocationAddress">Address (Optional)</Label>
                <Input
                  id="editLocationAddress"
                  value={newLocationAddress}
                  onChange={(e) => setNewLocationAddress(e.target.value)}
                  placeholder="Street address, city, state"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                <Label htmlFor="editIsDefault">Set as default location</Label>
              </div>
              <Button onClick={handleUpdateLocation} className="w-full">
                Update Location
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default LocationManagementPanel;
