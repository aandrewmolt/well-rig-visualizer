
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowRightLeft, Calendar as CalendarIcon, Package } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

const StorageTransferManager = () => {
  const { data, updateSingleEquipmentItem, addEquipmentItem } = useInventory();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [transferDate, setTransferDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');

  const getAvailableQuantity = (typeId: string, locationId: string) => {
    return data.equipmentItems
      .filter(item => item.typeId === typeId && item.locationId === locationId && item.status === 'available')
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleTransfer = async () => {
    if (!selectedEquipmentType || !fromLocation || !toLocation || quantity <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (fromLocation === toLocation) {
      toast.error('Source and destination locations must be different');
      return;
    }

    const availableQty = getAvailableQuantity(selectedEquipmentType, fromLocation);
    if (availableQty < quantity) {
      toast.error('Insufficient equipment at source location');
      return;
    }

    try {
      // Get all source items with available quantity
      const sourceItems = data.equipmentItems
        .filter(item => 
          item.typeId === selectedEquipmentType && 
          item.locationId === fromLocation && 
          item.status === 'available' &&
          item.quantity > 0
        )
        .sort((a, b) => b.quantity - a.quantity); // Start with largest quantities

      let remainingToTransfer = quantity;
      const sourceUpdates: Array<{id: string, newQuantity: number}> = [];

      // Calculate how much to deduct from each source item
      for (const sourceItem of sourceItems) {
        if (remainingToTransfer <= 0) break;
        
        const deductAmount = Math.min(sourceItem.quantity, remainingToTransfer);
        sourceUpdates.push({
          id: sourceItem.id,
          newQuantity: sourceItem.quantity - deductAmount
        });
        remainingToTransfer -= deductAmount;
      }

      // Update all source items
      await Promise.all(
        sourceUpdates.map(update => 
          updateSingleEquipmentItem(update.id, {
            quantity: update.newQuantity,
          })
        )
      );

      // Find existing destination item to merge with
      const destinationItem = data.equipmentItems.find(
        item => item.typeId === selectedEquipmentType && 
                item.locationId === toLocation && 
                item.status === 'available'
      );

      if (destinationItem) {
        // Merge with existing destination item
        await updateSingleEquipmentItem(destinationItem.id, {
          quantity: destinationItem.quantity + quantity,
          notes: notes ? `${destinationItem.notes || ''} Transfer: ${notes}`.trim() : destinationItem.notes,
        });
      } else {
        // Create new destination item only if none exists
        await addEquipmentItem({
          typeId: selectedEquipmentType,
          locationId: toLocation,
          quantity,
          status: 'available',
          notes: notes ? `Transferred from ${data.storageLocations.find(l => l.id === fromLocation)?.name}. ${notes}`.trim() : undefined,
        });
      }

      toast.success('Equipment transferred successfully');
      resetForm();
    } catch (error) {
      console.error('Transfer failed:', error);
      toast.error('Failed to transfer equipment');
    }
  };

  const resetForm = () => {
    setSelectedEquipmentType('');
    setQuantity(1);
    setFromLocation('');
    setToLocation('');
    setNotes('');
    setIsDialogOpen(false);
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowRightLeft className="h-5 w-5" />
            Storage Transfer
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Package className="mr-2 h-4 w-4" />
                Transfer Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Transfer Equipment Between Locations</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Equipment Type</label>
                  <Select value={selectedEquipmentType} onValueChange={setSelectedEquipmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.equipmentTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">From Location</label>
                    <Select value={fromLocation} onValueChange={setFromLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.storageLocations.map(location => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fromLocation && selectedEquipmentType && (
                      <div className="text-xs text-gray-500 mt-1">
                        Available: {getAvailableQuantity(selectedEquipmentType, fromLocation)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">To Location</label>
                    <Select value={toLocation} onValueChange={setToLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Destination" />
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
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Transfer Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(transferDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={transferDate}
                        onSelect={(date) => date && setTransferDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Transfer reason or notes..."
                  />
                </div>

                <Button onClick={handleTransfer} className="w-full">
                  Transfer Equipment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <ArrowRightLeft className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <p className="text-sm">Use the transfer button to move equipment between storage locations</p>
          <p className="text-xs text-gray-400 mt-1">All transfers automatically merge with existing items at the destination</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageTransferManager;
