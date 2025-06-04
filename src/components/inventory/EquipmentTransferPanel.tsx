
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowRightLeft, Package, Building, Briefcase, Plus } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useSupabaseJobs } from '@/hooks/useSupabaseJobs';
import { toast } from 'sonner';

const EquipmentTransferPanel = () => {
  const { data, updateSingleEquipmentItem, addEquipmentItem } = useSupabaseInventory();
  const { jobs } = useSupabaseJobs();
  const [selectedEquipmentType, setSelectedEquipmentType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const getEquipmentTypeName = (typeId: string) => {
    const type = data.equipmentTypes.find(t => t.id === typeId);
    return type?.name || 'Unknown Type';
  };

  const getLocationName = (locationId: string) => {
    const location = data.storageLocations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const getAvailableQuantity = (typeId: string, locationId: string) => {
    return data.equipmentItems
      .filter(item => 
        item.typeId === typeId && 
        item.locationId === locationId && 
        item.status === 'available'
      )
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleTransfer = async () => {
    if (!selectedEquipmentType || !fromLocationId || !toLocationId || quantity <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (fromLocationId === toLocationId) {
      toast.error('Source and destination must be different');
      return;
    }

    const availableQty = getAvailableQuantity(selectedEquipmentType, fromLocationId);
    if (availableQty < quantity) {
      toast.error('Insufficient equipment at source location');
      return;
    }

    setIsTransferring(true);
    try {
      // Find source item
      const sourceItem = data.equipmentItems.find(
        item => 
          item.typeId === selectedEquipmentType && 
          item.locationId === fromLocationId && 
          item.status === 'available' &&
          item.quantity >= quantity
      );

      if (!sourceItem) {
        toast.error('Source equipment not found');
        return;
      }

      // Deduct from source
      await updateSingleEquipmentItem(sourceItem.id, {
        quantity: sourceItem.quantity - quantity,
      });

      // Find or create destination item
      const destinationItem = data.equipmentItems.find(
        item => 
          item.typeId === selectedEquipmentType && 
          item.locationId === toLocationId && 
          item.status === 'available'
      );

      if (destinationItem) {
        // Add to existing destination
        await updateSingleEquipmentItem(destinationItem.id, {
          quantity: destinationItem.quantity + quantity,
        });
      } else {
        // Create new destination item
        await addEquipmentItem({
          typeId: selectedEquipmentType,
          locationId: toLocationId,
          quantity,
          status: 'available',
          notes: `Transferred from ${getLocationName(fromLocationId)}. ${notes}`.trim(),
        });
      }

      toast.success('Equipment transferred successfully');
      resetForm();
    } catch (error) {
      console.error('Transfer failed:', error);
      toast.error('Failed to transfer equipment');
    } finally {
      setIsTransferring(false);
    }
  };

  const resetForm = () => {
    setSelectedEquipmentType('');
    setQuantity(1);
    setFromLocationId('');
    setToLocationId('');
    setTransferReason('');
    setNotes('');
  };

  const recentTransfers = data.equipmentItems
    .filter(item => item.notes?.includes('Transferred from'))
    .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
    .slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Equipment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <Select value={fromLocationId} onValueChange={setFromLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {data.storageLocations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {location.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fromLocationId && selectedEquipmentType && (
                <div className="text-xs text-gray-500 mt-1">
                  Available: {getAvailableQuantity(selectedEquipmentType, fromLocationId)}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">To Location</label>
              <Select value={toLocationId} onValueChange={setToLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {data.storageLocations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {location.name}
                      </div>
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
            <label className="block text-sm font-medium mb-1">Transfer Reason</label>
            <Input
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="Job completion, maintenance, reallocation..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional transfer details..."
              className="h-20"
            />
          </div>

          <Button 
            onClick={handleTransfer} 
            className="w-full"
            disabled={isTransferring}
          >
            {isTransferring ? 'Transferring...' : 'Transfer Equipment'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Recent Transfers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransfers.length > 0 ? (
            <div className="space-y-3">
              {recentTransfers.map(item => (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{getEquipmentTypeName(item.typeId)}</span>
                    <Badge variant="outline">{item.quantity} units</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>To: {getLocationName(item.locationId)}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.lastUpdated.toLocaleDateString()} at {item.lastUpdated.toLocaleTimeString()}
                    </div>
                    {item.notes && (
                      <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ArrowRightLeft className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No recent transfers</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentTransferPanel;
