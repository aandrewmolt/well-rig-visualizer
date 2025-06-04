
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRightLeft, Package, Building } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { toast } from 'sonner';

interface TransferItem {
  id: string;
  type: 'equipment' | 'individual';
  typeName: string;
  quantity?: number;
  name?: string;
  status: string;
}

const BulkLocationTransfer = () => {
  const { data, updateSingleEquipmentItem, updateIndividualEquipment } = useInventory();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [excludedItems, setExcludedItems] = useState<Set<string>>(new Set());
  const [isTransferring, setIsTransferring] = useState(false);

  // Get all equipment items and individual equipment for the selected from location
  const availableItems = useMemo((): TransferItem[] => {
    if (!fromLocationId) return [];

    const items: TransferItem[] = [];

    // Add equipment items
    data.equipmentItems
      .filter(item => item.locationId === fromLocationId && item.quantity > 0)
      .forEach(item => {
        const equipmentType = data.equipmentTypes.find(type => type.id === item.typeId);
        if (equipmentType) {
          items.push({
            id: `equipment-${item.id}`,
            type: 'equipment',
            typeName: equipmentType.name,
            quantity: item.quantity,
            status: item.status,
          });
        }
      });

    // Add individual equipment
    data.individualEquipment
      .filter(item => item.locationId === fromLocationId)
      .forEach(item => {
        const equipmentType = data.equipmentTypes.find(type => type.id === item.typeId);
        if (equipmentType) {
          items.push({
            id: `individual-${item.id}`,
            type: 'individual',
            typeName: equipmentType.name,
            name: item.name,
            status: item.status,
          });
        }
      });

    return items;
  }, [fromLocationId, data]);

  // Filter out excluded items
  const itemsToTransfer = availableItems.filter(item => !excludedItems.has(item.id));

  const handleExcludeItem = (itemId: string) => {
    setExcludedItems(prev => new Set([...prev, itemId]));
  };

  const handleIncludeItem = (itemId: string) => {
    setExcludedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const handleTransfer = async () => {
    if (!fromLocationId || !toLocationId || itemsToTransfer.length === 0) {
      toast.error('Please select locations and ensure there are items to transfer');
      return;
    }

    if (fromLocationId === toLocationId) {
      toast.error('Source and destination locations must be different');
      return;
    }

    setIsTransferring(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const item of itemsToTransfer) {
        try {
          if (item.type === 'equipment') {
            const equipmentItemId = item.id.replace('equipment-', '');
            await updateSingleEquipmentItem(equipmentItemId, {
              locationId: toLocationId,
              lastUpdated: new Date(),
            });
          } else {
            const individualEquipmentId = item.id.replace('individual-', '');
            await updateIndividualEquipment(individualEquipmentId, {
              location_id: toLocationId,
              lastUpdated: new Date(),
            });
          }
          successCount++;
        } catch (error) {
          console.error(`Failed to transfer item ${item.id}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        const fromLocationName = data.storageLocations.find(loc => loc.id === fromLocationId)?.name;
        const toLocationName = data.storageLocations.find(loc => loc.id === toLocationId)?.name;
        toast.success(`Successfully transferred ${successCount} items from ${fromLocationName} to ${toLocationName}`);
      }

      if (errorCount > 0) {
        toast.error(`Failed to transfer ${errorCount} items`);
      }

      // Reset form if all transfers were successful
      if (errorCount === 0) {
        setFromLocationId('');
        setToLocationId('');
        setExcludedItems(new Set());
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Bulk transfer failed:', error);
      toast.error('Bulk transfer failed');
    } finally {
      setIsTransferring(false);
    }
  };

  const resetSelection = () => {
    setFromLocationId('');
    setToLocationId('');
    setExcludedItems(new Set());
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="h-5 w-5" />
            Bulk Location Transfer
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Transfer All Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Transfer All Equipment Between Locations</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">From Location</label>
                    <Select value={fromLocationId} onValueChange={setFromLocationId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source location" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.storageLocations.map(location => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">To Location</label>
                    <Select value={toLocationId} onValueChange={setToLocationId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination location" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.storageLocations
                          .filter(location => location.id !== fromLocationId)
                          .map(location => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {availableItems.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium">
                        Equipment to Transfer ({itemsToTransfer.length} of {availableItems.length})
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={resetSelection}
                      >
                        Reset Selection
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                      {availableItems.map(item => {
                        const isExcluded = excludedItems.has(item.id);
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 border rounded-lg ${
                              isExcluded ? 'bg-gray-50 opacity-60' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Package className="h-4 w-4 text-gray-500" />
                              <div>
                                <div className="font-medium">
                                  {item.typeName}
                                  {item.quantity && ` (${item.quantity}x)`}
                                </div>
                                {item.name && (
                                  <div className="text-sm text-gray-600">{item.name}</div>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {item.type}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {item.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              size="sm"
                              variant={isExcluded ? "outline" : "ghost"}
                              onClick={() => 
                                isExcluded 
                                  ? handleIncludeItem(item.id)
                                  : handleExcludeItem(item.id)
                              }
                              className={isExcluded ? "text-green-600" : "text-red-600 hover:text-red-700"}
                            >
                              {isExcluded ? (
                                <>Include</>
                              ) : (
                                <>
                                  <X className="h-4 w-4" />
                                  Exclude
                                </>
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {fromLocationId && availableItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>No equipment found at the selected location</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleTransfer}
                    disabled={!fromLocationId || !toLocationId || itemsToTransfer.length === 0 || isTransferring}
                    className="flex-1"
                  >
                    {isTransferring ? 'Transferring...' : `Transfer ${itemsToTransfer.length} Items`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isTransferring}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <ArrowRightLeft className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <p className="text-sm">Transfer all equipment from one location to another</p>
          <p className="text-xs text-gray-400 mt-1">Review and exclude specific items before transferring</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkLocationTransfer;
