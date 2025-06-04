
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, Package, Building, Minus, Plus } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { toast } from 'sonner';

interface TransferItem {
  id: string;
  type: 'equipment' | 'individual';
  typeId: string;
  typeName: string;
  availableQuantity: number;
  transferQuantity: number;
  name?: string;
  status: string;
  originalItemId: string;
}

const BulkLocationTransfer = () => {
  const { data, updateSingleEquipmentItem, updateIndividualEquipment } = useInventory();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);

  // Get all equipment items and individual equipment for the selected from location
  const availableItems = useMemo((): TransferItem[] => {
    if (!fromLocationId) return [];

    const items: TransferItem[] = [];

    // Add equipment items (grouped by type)
    const equipmentByType = new Map<string, { items: any[], typeName: string }>();
    
    data.equipmentItems
      .filter(item => item.locationId === fromLocationId && item.quantity > 0)
      .forEach(item => {
        const equipmentType = data.equipmentTypes.find(type => type.id === item.typeId);
        if (equipmentType) {
          if (!equipmentByType.has(item.typeId)) {
            equipmentByType.set(item.typeId, { items: [], typeName: equipmentType.name });
          }
          equipmentByType.get(item.typeId)!.items.push(item);
        }
      });

    // Create transfer items for equipment (one per type with total quantity)
    equipmentByType.forEach((group, typeId) => {
      const totalQuantity = group.items.reduce((sum, item) => sum + item.quantity, 0);
      items.push({
        id: `equipment-${typeId}`,
        type: 'equipment',
        typeId,
        typeName: group.typeName,
        availableQuantity: totalQuantity,
        transferQuantity: totalQuantity, // Default to all
        status: group.items[0].status,
        originalItemId: group.items[0].id, // Reference for updates
      });
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
            typeId: item.typeId,
            typeName: equipmentType.name,
            name: item.name,
            availableQuantity: 1,
            transferQuantity: 1,
            status: item.status,
            originalItemId: item.id,
          });
        }
      });

    return items;
  }, [fromLocationId, data]);

  // Update transfer items when available items change
  React.useEffect(() => {
    setTransferItems(availableItems);
  }, [availableItems]);

  const updateTransferQuantity = (itemId: string, newQuantity: number) => {
    setTransferItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, transferQuantity: Math.max(0, Math.min(newQuantity, item.availableQuantity)) }
          : item
      )
    );
  };

  const incrementQuantity = (itemId: string) => {
    const item = transferItems.find(i => i.id === itemId);
    if (item && item.transferQuantity < item.availableQuantity) {
      updateTransferQuantity(itemId, item.transferQuantity + 1);
    }
  };

  const decrementQuantity = (itemId: string) => {
    const item = transferItems.find(i => i.id === itemId);
    if (item && item.transferQuantity > 0) {
      updateTransferQuantity(itemId, item.transferQuantity - 1);
    }
  };

  const itemsToTransfer = transferItems.filter(item => item.transferQuantity > 0);
  const totalItemsToTransfer = itemsToTransfer.reduce((sum, item) => sum + item.transferQuantity, 0);

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
            // Handle bulk equipment transfers
            const relevantItems = data.equipmentItems.filter(
              equipItem => equipItem.typeId === item.typeId && equipItem.locationId === fromLocationId
            );
            
            let remainingToTransfer = item.transferQuantity;
            
            for (const equipItem of relevantItems) {
              if (remainingToTransfer <= 0) break;
              
              const transferFromThis = Math.min(remainingToTransfer, equipItem.quantity);
              const newQuantity = equipItem.quantity - transferFromThis;
              
              // Update the source item
              await updateSingleEquipmentItem(equipItem.id, {
                quantity: newQuantity,
                lastUpdated: new Date(),
              });
              
              // Create or update item at destination
              const existingDestItem = data.equipmentItems.find(
                destItem => destItem.typeId === item.typeId && destItem.locationId === toLocationId
              );
              
              if (existingDestItem) {
                await updateSingleEquipmentItem(existingDestItem.id, {
                  quantity: existingDestItem.quantity + transferFromThis,
                  lastUpdated: new Date(),
                });
              } else {
                // Create new item at destination
                const newItemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                await updateSingleEquipmentItem(newItemId, {
                  id: newItemId,
                  typeId: item.typeId,
                  locationId: toLocationId,
                  quantity: transferFromThis,
                  status: 'available',
                  lastUpdated: new Date(),
                });
              }
              
              remainingToTransfer -= transferFromThis;
            }
          } else {
            // Handle individual equipment - use the correct field name and method
            console.log('Transferring individual equipment:', item.originalItemId, 'to location:', toLocationId);
            await updateIndividualEquipment(item.originalItemId, {
              locationId: toLocationId, // Use locationId, not location_id
              lastUpdated: new Date(),
            });
            console.log('Individual equipment transfer completed');
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
        toast.success(`Successfully transferred ${totalItemsToTransfer} items from ${fromLocationName} to ${toLocationName}`);
      }

      if (errorCount > 0) {
        toast.error(`Failed to transfer ${errorCount} items`);
      }

      // Reset form if all transfers were successful
      if (errorCount === 0) {
        setFromLocationId('');
        setToLocationId('');
        setTransferItems([]);
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
    setTransferItems(availableItems.map(item => ({ ...item, transferQuantity: item.availableQuantity })));
  };

  const selectNone = () => {
    setTransferItems(prev => prev.map(item => ({ ...item, transferQuantity: 0 })));
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
                Transfer Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Transfer Equipment Between Locations</DialogTitle>
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

                {transferItems.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium">
                        Equipment to Transfer ({totalItemsToTransfer} of {transferItems.reduce((sum, item) => sum + item.availableQuantity, 0)})
                      </h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={selectNone}>
                          Select None
                        </Button>
                        <Button variant="outline" size="sm" onClick={resetSelection}>
                          Select All
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                      {transferItems.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="font-medium">
                                {item.typeName}
                                {item.name && (
                                  <span className="text-sm text-gray-600 ml-2">({item.name})</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {item.type}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {item.status}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Available: {item.availableQuantity}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => decrementQuantity(item.id)}
                              disabled={item.transferQuantity <= 0}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              min="0"
                              max={item.availableQuantity}
                              value={item.transferQuantity}
                              onChange={(e) => updateTransferQuantity(item.id, parseInt(e.target.value) || 0)}
                              className="w-16 h-8 text-center"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => incrementQuantity(item.id)}
                              disabled={item.transferQuantity >= item.availableQuantity}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {fromLocationId && transferItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>No equipment found at the selected location</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleTransfer}
                    disabled={!fromLocationId || !toLocationId || totalItemsToTransfer === 0 || isTransferring}
                    className="flex-1"
                  >
                    {isTransferring ? 'Transferring...' : `Transfer ${totalItemsToTransfer} Items`}
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
          <p className="text-sm">Transfer equipment between locations with granular quantity control</p>
          <p className="text-xs text-gray-400 mt-1">Select exact quantities to transfer for each equipment type</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkLocationTransfer;
