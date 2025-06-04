import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Package, X, AlertTriangle } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { toast } from 'sonner';

interface ExtrasOnLocationPanelProps {
  extrasOnLocation: Array<{
    id: string;
    equipmentTypeId: string;
    quantity: number;
    reason: string;
    addedDate: Date;
    notes?: string;
    individualEquipmentId?: string;
  }>;
  onAddExtra: (equipmentTypeId: string, quantity: number, reason: string, notes?: string, individualEquipmentId?: string) => void;
  onRemoveExtra: (extraId: string) => void;
}

const ExtrasOnLocationPanel: React.FC<ExtrasOnLocationPanelProps> = ({
  extrasOnLocation,
  onAddExtra,
  onRemoveExtra,
}) => {
  const { data } = useInventoryData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState('');
  const [selectedIndividualEquipment, setSelectedIndividualEquipment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const getEquipmentTypeName = (typeId: string) => {
    return data.equipmentTypes.find(type => type.id === typeId)?.name || 'Unknown';
  };

  const getIndividualEquipmentName = (equipmentId: string) => {
    return data.individualEquipment.find(eq => eq.id === equipmentId)?.equipmentId || 'Unknown';
  };

  const selectedType = data.equipmentTypes.find(type => type.id === selectedEquipmentType);
  const requiresIndividualTracking = selectedType?.requiresIndividualTracking || false;

  // Get available individual equipment for the selected type
  const availableIndividualEquipment = data.individualEquipment.filter(
    eq => eq.typeId === selectedEquipmentType && eq.status === 'available'
  );

  const handleAddExtra = () => {
    if (!selectedEquipmentType || !reason.trim()) {
      toast.error('Please select equipment type and provide a reason');
      return;
    }

    if (requiresIndividualTracking) {
      if (!selectedIndividualEquipment) {
        toast.error('Please select a specific equipment item for individually tracked equipment');
        return;
      }
      // For individually tracked equipment, quantity is always 1
      onAddExtra(selectedEquipmentType, 1, reason.trim(), notes.trim() || undefined, selectedIndividualEquipment);
    } else {
      if (quantity <= 0) {
        toast.error('Please enter a valid quantity');
        return;
      }
      onAddExtra(selectedEquipmentType, quantity, reason.trim(), notes.trim() || undefined);
    }
    
    // Reset form
    setSelectedEquipmentType('');
    setSelectedIndividualEquipment('');
    setQuantity(1);
    setReason('');
    setNotes('');
    setIsDialogOpen(false);
  };

  const handleEquipmentTypeChange = (typeId: string) => {
    setSelectedEquipmentType(typeId);
    setSelectedIndividualEquipment(''); // Reset individual selection when type changes
    setQuantity(1); // Reset quantity
  };

  const commonReasons = [
    'Backup/Spare',
    'Customer Request',
    'Emergency Replacement',
    'Testing Equipment',
    'Future Phase',
    'Maintenance Reserve',
  ];

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Extras on Location
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Extra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Extra Equipment on Location</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Equipment Type</label>
                  <Select value={selectedEquipmentType} onValueChange={handleEquipmentTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {data.equipmentTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            {type.name}
                            {type.requiresIndividualTracking && (
                              <Badge variant="outline" className="text-xs">Individual</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {requiresIndividualTracking ? (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Select Specific Equipment
                      <AlertTriangle className="inline h-4 w-4 ml-1 text-orange-500" />
                    </label>
                    {availableIndividualEquipment.length > 0 ? (
                      <Select value={selectedIndividualEquipment} onValueChange={setSelectedIndividualEquipment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specific equipment" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {availableIndividualEquipment.map(equipment => (
                            <SelectItem key={equipment.id} value={equipment.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{equipment.equipmentId}</span>
                                <span className="text-sm text-gray-500">{equipment.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-700">
                          No available equipment of this type found. Please ensure equipment is available in inventory.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Reason</label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason or type custom" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {commonReasons.map(reasonOption => (
                        <SelectItem key={reasonOption} value={reasonOption}>
                          {reasonOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!commonReasons.includes(reason) && (
                    <Input
                      className="mt-2"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter custom reason..."
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional details about this extra equipment..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleAddExtra} 
                  className="w-full"
                  disabled={!selectedEquipmentType || !reason.trim() || (requiresIndividualTracking && !selectedIndividualEquipment)}
                >
                  Add Extra Equipment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {extrasOnLocation.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <p className="text-sm">No extra equipment on location</p>
            <p className="text-xs text-gray-400 mt-1">
              Track additional equipment beyond diagram requirements
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Extra Equipment:</h4>
            {extrasOnLocation.map(extra => {
              const equipmentType = data.equipmentTypes.find(type => type.id === extra.equipmentTypeId);
              const isIndividuallyTracked = equipmentType?.requiresIndividualTracking;
              
              return (
                <div key={extra.id} className="flex items-start justify-between p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-lg">{getEquipmentTypeName(extra.equipmentTypeId)}</span>
                      {isIndividuallyTracked && extra.individualEquipmentId ? (
                        <Badge variant="secondary" className="text-sm font-bold bg-blue-100 text-blue-800">
                          {getIndividualEquipmentName(extra.individualEquipmentId)}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-sm">{extra.quantity}x</Badge>
                      )}
                      <Badge variant="outline" className="text-xs bg-yellow-100">
                        Extra
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div><strong>Reason:</strong> {extra.reason}</div>
                      <div><strong>Added:</strong> {extra.addedDate.toLocaleDateString()}</div>
                      {extra.notes && (
                        <div><strong>Notes:</strong> {extra.notes}</div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRemoveExtra(extra.id)}
                    className="h-7 w-7 p-0 ml-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExtrasOnLocationPanel;
