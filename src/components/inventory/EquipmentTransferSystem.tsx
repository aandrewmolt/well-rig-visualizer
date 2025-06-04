
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowRightLeft, Package, MapPin, Calendar, User } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { toast } from 'sonner';

const EquipmentTransferSystem: React.FC = () => {
  const { data, updateSingleEquipmentItem, updateSingleIndividualEquipment } = useInventoryData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    equipmentType: '',
    equipmentId: '',
    fromLocationId: '',
    toLocationId: '',
    quantity: 1,
    reason: '',
    transferredBy: ''
  });

  const [transfers, setTransfers] = useState<any[]>([]);

  const availableEquipment = [
    ...data.equipmentItems.filter(item => item.status === 'available'),
    ...data.individualEquipment.filter(eq => eq.status === 'available')
  ];

  const handleTransfer = async () => {
    if (!transferData.equipmentId || !transferData.fromLocationId || !transferData.toLocationId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (transferData.fromLocationId === transferData.toLocationId) {
      toast.error('Source and destination locations cannot be the same');
      return;
    }

    try {
      const equipment = availableEquipment.find(eq => eq.id === transferData.equipmentId);
      if (!equipment) {
        toast.error('Equipment not found');
        return;
      }

      const isIndividual = 'equipmentId' in equipment;
      const updates = {
        locationId: transferData.toLocationId,
        lastUpdated: new Date()
      };

      if (isIndividual) {
        await updateSingleIndividualEquipment(equipment.id, updates);
      } else {
        // For bulk equipment, we need to handle quantity
        if (transferData.quantity > equipment.quantity) {
          toast.error('Transfer quantity exceeds available quantity');
          return;
        }
        
        if (transferData.quantity === equipment.quantity) {
          await updateSingleEquipmentItem(equipment.id, updates);
        } else {
          // Split the equipment item
          await updateSingleEquipmentItem(equipment.id, {
            quantity: equipment.quantity - transferData.quantity
          });
          // Create new item at destination (this would need a different approach)
          toast.info('Partial transfer completed - manual creation of destination item required');
        }
      }

      // Record the transfer
      const transferRecord = {
        id: `transfer-${Date.now()}`,
        equipmentId: equipment.id,
        equipmentName: isIndividual ? equipment.equipmentId : equipment.typeId,
        fromLocationId: transferData.fromLocationId,
        toLocationId: transferData.toLocationId,
        quantity: transferData.quantity,
        reason: transferData.reason,
        transferredBy: transferData.transferredBy,
        timestamp: new Date(),
        isIndividual
      };

      setTransfers(prev => [transferRecord, ...prev]);
      toast.success('Transfer completed successfully');
      
      setIsDialogOpen(false);
      setTransferData({
        equipmentType: '',
        equipmentId: '',
        fromLocationId: '',
        toLocationId: '',
        quantity: 1,
        reason: '',
        transferredBy: ''
      });
    } catch (error) {
      console.error('Error transferring equipment:', error);
      toast.error('Failed to transfer equipment');
    }
  };

  const getLocationName = (locationId: string) => {
    const location = data.storageLocations.find(l => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const getTypeName = (typeId: string) => {
    const type = data.equipmentTypes.find(t => t.id === typeId);
    return type?.name || 'Unknown Type';
  };

  const filteredEquipment = transferData.equipmentType 
    ? availableEquipment.filter(eq => eq.typeId === transferData.equipmentType)
    : availableEquipment;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Equipment Transfers</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              New Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Transfer Equipment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Equipment Type</Label>
                <Select 
                  value={transferData.equipmentType} 
                  onValueChange={(value) => setTransferData(prev => ({ 
                    ...prev, 
                    equipmentType: value,
                    equipmentId: '' 
                  }))}
                >
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

              {transferData.equipmentType && (
                <div>
                  <Label>Equipment Item *</Label>
                  <Select 
                    value={transferData.equipmentId} 
                    onValueChange={(value) => {
                      const equipment = filteredEquipment.find(eq => eq.id === value);
                      setTransferData(prev => ({ 
                        ...prev, 
                        equipmentId: value,
                        fromLocationId: equipment?.locationId || '',
                        quantity: 'equipmentId' in equipment ? 1 : (equipment as any)?.quantity || 1
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredEquipment.map(equipment => {
                        const isIndividual = 'equipmentId' in equipment;
                        return (
                          <SelectItem key={equipment.id} value={equipment.id}>
                            {isIndividual 
                              ? `${equipment.equipmentId} - ${equipment.name}`
                              : `${getTypeName(equipment.typeId)} (Qty: ${(equipment as any).quantity})`
                            }
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Location</Label>
                  <Select 
                    value={transferData.fromLocationId} 
                    onValueChange={(value) => setTransferData(prev => ({ ...prev, fromLocationId: value }))}
                    disabled
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-filled" />
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
                  <Label>To Location *</Label>
                  <Select 
                    value={transferData.toLocationId} 
                    onValueChange={(value) => setTransferData(prev => ({ ...prev, toLocationId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.storageLocations.filter(loc => loc.id !== transferData.fromLocationId).map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {transferData.equipmentId && !('equipmentId' in filteredEquipment.find(eq => eq.id === transferData.equipmentId)!) && (
                <div>
                  <Label>Quantity to Transfer</Label>
                  <Input
                    type="number"
                    min="1"
                    max={(filteredEquipment.find(eq => eq.id === transferData.equipmentId) as any)?.quantity || 1}
                    value={transferData.quantity}
                    onChange={(e) => setTransferData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              )}

              <div>
                <Label>Transfer Reason</Label>
                <Textarea
                  value={transferData.reason}
                  onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Reason for transfer..."
                />
              </div>

              <div>
                <Label>Transferred By</Label>
                <Input
                  value={transferData.transferredBy}
                  onChange={(e) => setTransferData(prev => ({ ...prev, transferredBy: e.target.value }))}
                  placeholder="Your name"
                />
              </div>

              <Button onClick={handleTransfer} className="w-full">
                Complete Transfer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transfer History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Transfers</h3>
        {transfers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-600">No transfers recorded yet</p>
            </CardContent>
          </Card>
        ) : (
          transfers.map((transfer) => (
            <Card key={transfer.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">{transfer.equipmentName}</h4>
                      <p className="text-sm text-gray-600">
                        Quantity: {transfer.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{transfer.timestamp.toLocaleDateString()}</p>
                    <p>{transfer.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>From: {getLocationName(transfer.fromLocationId)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>To: {getLocationName(transfer.toLocationId)}</span>
                  </div>
                </div>

                {transfer.reason && (
                  <p className="mt-2 text-sm text-gray-700">
                    <strong>Reason:</strong> {transfer.reason}
                  </p>
                )}

                {transfer.transferredBy && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>By: {transfer.transferredBy}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EquipmentTransferSystem;
