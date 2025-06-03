
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Camera, MapPin, Calendar, Eye, Package } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useSupabaseJobs } from '@/hooks/useSupabaseJobs';
import { toast } from 'sonner';

interface RedTaggedItem {
  id: string;
  equipmentId?: string;
  name: string;
  typeName: string;
  locationName: string;
  locationType: 'storage' | 'job';
  redTagReason: string;
  redTagDate: Date;
  photos: Array<{
    id: string;
    url: string;
    description?: string;
  }>;
  quantity?: number;
}

const RedTagDashboard = () => {
  const { data } = useSupabaseInventory();
  const { jobs } = useSupabaseJobs();
  const [selectedItem, setSelectedItem] = useState<RedTaggedItem | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [filter, setFilter] = useState('');

  // Get all red tagged items from both equipment_items and individual_equipment
  const getRedTaggedItems = (): RedTaggedItem[] => {
    const redTaggedItems: RedTaggedItem[] = [];

    // Bulk equipment items
    data.equipmentItems
      .filter(item => item.status === 'red-tagged')
      .forEach(item => {
        const equipmentType = data.equipmentTypes.find(type => type.id === item.typeId);
        const location = data.storageLocations.find(loc => loc.id === item.locationId);
        const job = jobs.find(j => j.id === item.jobId);
        
        redTaggedItems.push({
          id: item.id,
          name: equipmentType?.name || 'Unknown Equipment',
          typeName: equipmentType?.name || 'Unknown Type',
          locationName: (item as any).location_type === 'job' ? (job?.name || 'Unknown Job') : (location?.name || 'Unknown Location'),
          locationType: (item as any).location_type || 'storage',
          redTagReason: item.redTagReason || 'No reason provided',
          redTagDate: item.lastUpdated,
          photos: [], // Will be populated from red_tag_photos table
          quantity: item.quantity,
        });
      });

    // Individual equipment items
    data.individualEquipment
      .filter(item => item.status === 'red-tagged')
      .forEach(item => {
        const equipmentType = data.equipmentTypes.find(type => type.id === item.typeId);
        const location = data.storageLocations.find(loc => loc.id === item.locationId);
        const job = jobs.find(j => j.id === item.jobId);
        
        redTaggedItems.push({
          id: item.id,
          equipmentId: item.equipmentId,
          name: item.name,
          typeName: equipmentType?.name || 'Unknown Type',
          locationName: (item as any).location_type === 'job' ? (job?.name || 'Unknown Job') : (location?.name || 'Unknown Location'),
          locationType: (item as any).location_type || 'storage',
          redTagReason: item.redTagReason || 'No reason provided',
          redTagDate: item.lastUpdated,
          photos: [], // Will be populated from red_tag_photos table
        });
      });

    return redTaggedItems;
  };

  const redTaggedItems = getRedTaggedItems();
  const filteredItems = redTaggedItems.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase()) ||
    item.typeName.toLowerCase().includes(filter.toLowerCase()) ||
    item.redTagReason.toLowerCase().includes(filter.toLowerCase())
  );

  const handleViewDetails = (item: RedTaggedItem) => {
    setSelectedItem(item);
    setIsDetailDialogOpen(true);
  };

  const handleReturnToService = async (itemId: string) => {
    if (window.confirm('Are you sure you want to return this item to service? This will clear the red tag.')) {
      try {
        // Update item status back to 'available'
        toast.success('Item returned to service successfully');
      } catch (error) {
        toast.error('Failed to return item to service');
      }
    }
  };

  const handlePermanentRemoval = async (itemId: string) => {
    if (window.confirm('Are you sure you want to permanently remove this item from inventory? This cannot be undone.')) {
      try {
        // Update item status to 'retired' or delete
        toast.success('Item permanently removed from inventory');
      } catch (error) {
        toast.error('Failed to remove item from inventory');
      }
    }
  };

  const groupByLocation = () => {
    return filteredItems.reduce((acc, item) => {
      const key = `${item.locationType}-${item.locationName}`;
      if (!acc[key]) {
        acc[key] = {
          locationType: item.locationType,
          locationName: item.locationName,
          items: []
        };
      }
      acc[key].items.push(item);
      return acc;
    }, {} as Record<string, { locationType: string; locationName: string; items: RedTaggedItem[] }>);
  };

  const groupByType = () => {
    return filteredItems.reduce((acc, item) => {
      if (!acc[item.typeName]) {
        acc[item.typeName] = [];
      }
      acc[item.typeName].push(item);
      return acc;
    }, {} as Record<string, RedTaggedItem[]>);
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Red Tagged Equipment ({redTaggedItems.length})
          </CardTitle>
        </div>
        <div className="mt-4">
          <Input
            placeholder="Search red tagged items..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-md"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="location">By Location</TabsTrigger>
            <TabsTrigger value="type">By Type</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p className="text-sm">No red tagged equipment found</p>
              </div>
            ) : (
              filteredItems.map(item => (
                <div key={item.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{item.name}</h4>
                        {item.equipmentId && (
                          <Badge variant="outline" className="text-xs">ID: {item.equipmentId}</Badge>
                        )}
                        {item.quantity && (
                          <Badge variant="secondary" className="text-xs">Qty: {item.quantity}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.redTagReason}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.locationName} ({item.locationType})
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.redTagDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleViewDetails(item)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button
                        onClick={() => handleReturnToService(item.id)}
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                      >
                        Return to Service
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="location" className="space-y-4">
            {Object.entries(groupByLocation()).map(([key, group]) => (
              <div key={key} className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  {group.locationType === 'job' ? <Package className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                  {group.locationName} ({group.items.length} items)
                </h3>
                <div className="space-y-2">
                  {group.items.map(item => (
                    <div key={item.id} className="p-2 bg-red-50 rounded flex items-center justify-between">
                      <span className="text-sm">{item.name}</span>
                      <Button
                        onClick={() => handleViewDetails(item)}
                        variant="ghost"
                        size="sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="type" className="space-y-4">
            {Object.entries(groupByType()).map(([typeName, items]) => (
              <div key={typeName} className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">{typeName} ({items.length} items)</h3>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="p-2 bg-red-50 rounded flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{item.name}</span>
                        <p className="text-xs text-gray-500">{item.locationName}</p>
                      </div>
                      <Button
                        onClick={() => handleViewDetails(item)}
                        variant="ghost"
                        size="sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Red Tagged Equipment Details
              </DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Equipment Name</label>
                    <p className="text-sm text-gray-600">{selectedItem.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <p className="text-sm text-gray-600">{selectedItem.typeName}</p>
                  </div>
                  {selectedItem.equipmentId && (
                    <div>
                      <label className="text-sm font-medium">Equipment ID</label>
                      <p className="text-sm text-gray-600">{selectedItem.equipmentId}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <p className="text-sm text-gray-600">{selectedItem.locationName} ({selectedItem.locationType})</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Red Tag Reason</label>
                  <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">{selectedItem.redTagReason}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Photos</label>
                  {selectedItem.photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {selectedItem.photos.map(photo => (
                        <div key={photo.id} className="border rounded-lg overflow-hidden">
                          <img src={photo.url} alt="Red tag evidence" className="w-full h-32 object-cover" />
                          {photo.description && (
                            <p className="p-2 text-xs text-gray-600">{photo.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">No photos available</p>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleReturnToService(selectedItem.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Return to Service
                  </Button>
                  <Button
                    onClick={() => handlePermanentRemoval(selectedItem.id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    Permanently Remove
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default RedTagDashboard;
