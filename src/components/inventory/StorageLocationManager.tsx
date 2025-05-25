
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Plus, Package, AlertTriangle } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { toast } from 'sonner';
import EquipmentDetailCard from './EquipmentDetailCard';

const StorageLocationManager = () => {
  const { data, updateStorageLocations, updateEquipmentItems } = useInventoryData();
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationAddress, setNewLocationAddress] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addLocation = () => {
    if (!newLocationName.trim()) {
      toast.error('Please enter a location name');
      return;
    }

    const newLocation = {
      id: Date.now().toString(),
      name: newLocationName.trim(),
      address: newLocationAddress.trim() || undefined,
      isDefault: data.storageLocations.length === 0,
    };

    updateStorageLocations([...data.storageLocations, newLocation]);
    setNewLocationName('');
    setNewLocationAddress('');
    setIsDialogOpen(false);
    toast.success(`Location "${newLocation.name}" added successfully!`);
  };

  const getLocationEquipment = (locationId: string) => {
    const locationItems = data.equipmentItems.filter(item => item.locationId === locationId);
    const equipmentByType = new Map();

    locationItems.forEach(item => {
      const key = item.typeId;
      if (!equipmentByType.has(key)) {
        equipmentByType.set(key, []);
      }
      equipmentByType.get(key).push(item);
    });

    return equipmentByType;
  };

  const getTotalEquipmentCount = (locationId: string) => {
    return data.equipmentItems
      .filter(item => item.locationId === locationId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const getAvailableEquipmentCount = (locationId: string) => {
    return data.equipmentItems
      .filter(item => item.locationId === locationId && item.status === 'available')
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const getRedTaggedEquipmentCount = (locationId: string) => {
    return data.equipmentItems
      .filter(item => item.locationId === locationId && item.status === 'red-tagged')
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleRedTag = (itemId: string) => {
    // This would open a red tag modal in a real implementation
    toast.info('Red tag functionality will be implemented with photo upload');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Storage Locations</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Storage Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Location Name</label>
                <Input
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder="Enter location name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address (Optional)</label>
                <Input
                  value={newLocationAddress}
                  onChange={(e) => setNewLocationAddress(e.target.value)}
                  placeholder="Enter address..."
                />
              </div>
              <Button onClick={addLocation} className="w-full">
                Add Location
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.storageLocations.map(location => {
          const locationEquipment = getLocationEquipment(location.id);
          const totalCount = getTotalEquipmentCount(location.id);
          const availableCount = getAvailableEquipmentCount(location.id);
          const redTaggedCount = getRedTaggedEquipmentCount(location.id);

          return (
            <Card key={location.id} className="bg-white shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    {location.name}
                    {location.isDefault && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
                  </CardTitle>
                </div>
                {location.address && (
                  <p className="text-sm text-gray-600">{location.address}</p>
                )}
                
                {/* Location Summary */}
                <div className="grid grid-cols-3 gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="font-semibold text-lg">{totalCount}</div>
                    <div className="text-xs text-gray-600">Total Items</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="font-semibold text-lg text-green-600">{availableCount}</div>
                    <div className="text-xs text-gray-600">Available</div>
                  </div>
                  {redTaggedCount > 0 && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="font-semibold text-lg text-red-600">{redTaggedCount}</div>
                      <div className="text-xs text-gray-600">Red Tagged</div>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {locationEquipment.size === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>No equipment at this location</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">Equipment Breakdown:</h4>
                    {Array.from(locationEquipment.entries()).map(([typeId, items]) => {
                      const equipmentType = data.equipmentTypes.find(type => type.id === typeId);
                      if (!equipmentType) return null;

                      const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
                      const availableQty = items
                        .filter(item => item.status === 'available')
                        .reduce((sum, item) => sum + item.quantity, 0);
                      const deployedQty = items
                        .filter(item => item.status === 'deployed')
                        .reduce((sum, item) => sum + item.quantity, 0);
                      const redTaggedQty = items
                        .filter(item => item.status === 'red-tagged')
                        .reduce((sum, item) => sum + item.quantity, 0);

                      return (
                        <div key={typeId} className="p-3 border rounded-lg bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{equipmentType.name}</span>
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                              >
                                {totalQty}x total
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span>{availableQty}x available</span>
                            </div>
                            {deployedQty > 0 && (
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                <span>{deployedQty}x deployed</span>
                              </div>
                            )}
                            {redTaggedQty > 0 && (
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                <span>{redTaggedQty}x red tagged</span>
                              </div>
                            )}
                          </div>

                          {availableQty > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRedTag(items[0].id)}
                                className="h-6 px-2 text-xs"
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Red Tag
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StorageLocationManager;
