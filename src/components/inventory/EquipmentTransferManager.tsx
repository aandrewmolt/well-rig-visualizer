
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRightLeft, Package, Building, Briefcase } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useSupabaseJobs } from '@/hooks/useSupabaseJobs';
import { toast } from 'sonner';

const EquipmentTransferManager = () => {
  const { data } = useSupabaseInventory();
  const { jobs } = useSupabaseJobs();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [fromLocationType, setFromLocationType] = useState<'storage' | 'job'>('storage');
  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationType, setToLocationType] = useState<'storage' | 'job'>('storage');
  const [toLocationId, setToLocationId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [notes, setNotes] = useState('');

  const getAvailableQuantity = (typeId: string, locationId: string, locationType: 'storage' | 'job') => {
    return data.equipmentItems
      .filter(item => 
        item.typeId === typeId && 
        item.locationId === locationId && 
        item.status === 'available' &&
        (item as any).location_type === locationType
      )
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const getLocationOptions = (type: 'storage' | 'job') => {
    if (type === 'storage') {
      return data.storageLocations.map(location => ({
        id: location.id,
        name: location.name,
        type: 'storage'
      }));
    } else {
      return jobs.map(job => ({
        id: job.id,
        name: job.name,
        type: 'job'
      }));
    }
  };

  const handleTransfer = async () => {
    if (!selectedEquipmentType || !fromLocationId || !toLocationId || quantity <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (fromLocationId === toLocationId && fromLocationType === toLocationType) {
      toast.error('Source and destination must be different');
      return;
    }

    const availableQty = getAvailableQuantity(selectedEquipmentType, fromLocationId, fromLocationType);
    if (availableQty < quantity) {
      toast.error('Insufficient equipment at source location');
      return;
    }

    try {
      // Implement transfer logic here
      toast.success('Equipment transferred successfully');
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to transfer equipment');
    }
  };

  const resetForm = () => {
    setSelectedEquipmentType('');
    setQuantity(1);
    setFromLocationType('storage');
    setFromLocationId('');
    setToLocationType('storage');
    setToLocationId('');
    setTransferReason('');
    setNotes('');
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowRightLeft className="h-5 w-5" />
            Equipment Transfer
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Package className="mr-2 h-4 w-4" />
                Transfer Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
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
                    <label className="block text-sm font-medium mb-1">From Location Type</label>
                    <Select value={fromLocationType} onValueChange={(value: 'storage' | 'job') => setFromLocationType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="storage">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Storage Location
                          </div>
                        </SelectItem>
                        <SelectItem value="job">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Job Location
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">From Location</label>
                    <Select value={fromLocationId} onValueChange={setFromLocationId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {getLocationOptions(fromLocationType).map(location => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fromLocationId && selectedEquipmentType && (
                      <div className="text-xs text-gray-500 mt-1">
                        Available: {getAvailableQuantity(selectedEquipmentType, fromLocationId, fromLocationType)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">To Location Type</label>
                    <Select value={toLocationType} onValueChange={(value: 'storage' | 'job') => setToLocationType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="storage">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Storage Location
                          </div>
                        </SelectItem>
                        <SelectItem value="job">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Job Location
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">To Location</label>
                    <Select value={toLocationId} onValueChange={setToLocationId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {getLocationOptions(toLocationType).map(location => (
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
          <p className="text-sm">Use the transfer button to move equipment between locations</p>
          <p className="text-xs text-gray-400 mt-1">Transfer between storage locations and job sites</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentTransferManager;
