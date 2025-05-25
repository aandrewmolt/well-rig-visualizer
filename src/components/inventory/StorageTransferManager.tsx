
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowRightLeft, Calendar as CalendarIcon, Package } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { toast } from 'sonner';
import { format } from 'date-fns';

const StorageTransferManager = () => {
  const { data, updateEquipmentItems } = useInventoryData();
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

  const handleTransfer = () => {
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

    const updatedItems = [...data.equipmentItems];
    
    // Find and update source item
    const sourceItem = updatedItems.find(
      item => item.typeId === selectedEquipmentType && item.locationId === fromLocation && item.status === 'available'
    );
    
    if (sourceItem) {
      sourceItem.quantity -= quantity;
      sourceItem.lastUpdated = transferDate;
    }

    // Find or create destination item
    const destItem = updatedItems.find(
      item => item.typeId === selectedEquipmentType && item.locationId === toLocation && item.status === 'available'
    );
    
    if (destItem) {
      destItem.quantity += quantity;
      destItem.lastUpdated = transferDate;
    } else {
      updatedItems.push({
        id: `transfer-${Date.now()}`,
        typeId: selectedEquipmentType,
        locationId: toLocation,
        quantity,
        status: 'available',
        notes,
        lastUpdated: transferDate,
      });
    }

    updateEquipmentItems(updatedItems);
    
    // Reset form
    setSelectedEquipmentType('');
    setQuantity(1);
    setFromLocation('');
    setToLocation('');
    setNotes('');
    setIsDialogOpen(false);
    
    const equipmentName = data.equipmentTypes.find(type => type.id === selectedEquipmentType)?.name;
    const fromLocationName = data.storageLocations.find(loc => loc.id === fromLocation)?.name;
    const toLocationName = data.storageLocations.find(loc => loc.id === toLocation)?.name;
    
    toast.success(`${quantity}x ${equipmentName} transferred from ${fromLocationName} to ${toLocationName}`);
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
          <p className="text-xs text-gray-400 mt-1">All transfers are tracked with dates and can be modified</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageTransferManager;
