
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit2, History, MapPin } from 'lucide-react';
import { useInventoryData, EquipmentItem } from '@/hooks/useInventoryData';
import { useAuditTrail } from '@/hooks/useAuditTrail';
import { toast } from 'sonner';

interface EquipmentQuantityEditorProps {
  equipmentTypeId: string;
  equipmentTypeName: string;
  currentItems: EquipmentItem[];
}

const EquipmentQuantityEditor = ({ equipmentTypeId, equipmentTypeName, currentItems }: EquipmentQuantityEditorProps) => {
  const { data, updateEquipmentItems } = useInventoryData();
  const { addAuditEntry, getAuditTrailForEntity, formatAuditEntry } = useAuditTrail();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedQuantities, setEditedQuantities] = useState<Record<string, number>>({});
  const [changeReason, setChangeReason] = useState('');

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setEditedQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  const handleSave = () => {
    if (!changeReason.trim()) {
      toast.error('Please provide a reason for the quantity change');
      return;
    }

    const updatedItems = data.equipmentItems.map(item => {
      if (editedQuantities[item.id] !== undefined) {
        const oldQuantity = item.quantity;
        const newQuantity = editedQuantities[item.id];
        
        // Add audit entry for the change
        addAuditEntry({
          action: 'modify',
          entityType: 'equipment',
          entityId: equipmentTypeId,
          details: {
            before: { quantity: oldQuantity },
            after: { quantity: newQuantity },
            reason: changeReason,
            locationId: item.locationId
          },
          metadata: { source: 'manual' }
        });

        return {
          ...item,
          quantity: newQuantity,
          lastUpdated: new Date()
        };
      }
      return item;
    });

    updateEquipmentItems(updatedItems);
    toast.success(`Updated quantities for ${equipmentTypeName}`);
    setIsDialogOpen(false);
    setEditedQuantities({});
    setChangeReason('');
  };

  const getLocationName = (locationId: string) => {
    return data.storageLocations.find(loc => loc.id === locationId)?.name || 'Unknown';
  };

  const auditHistory = getAuditTrailForEntity('equipment', equipmentTypeId)
    .filter(entry => entry.action === 'modify')
    .slice(0, 5);

  const totalQuantity = currentItems.reduce((sum, item) => {
    const quantity = editedQuantities[item.id] ?? item.quantity;
    return sum + quantity;
  }, 0);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex items-center gap-1">
          <Edit2 className="h-3 w-3" />
          Edit ({totalQuantity})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Edit Quantities: {equipmentTypeName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Quantities by Location */}
          <div>
            <Label className="text-base font-medium">Current Quantities by Location</Label>
            <div className="space-y-3 mt-2">
              {currentItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{getLocationName(item.locationId)}</span>
                    <Badge variant={
                      item.status === 'available' ? 'default' :
                      item.status === 'deployed' ? 'secondary' : 'destructive'
                    }>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <Input
                      type="number"
                      min="0"
                      value={editedQuantities[item.id] ?? item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                      className="w-20"
                      disabled={item.status === 'deployed'}
                    />
                    {item.status === 'deployed' && (
                      <span className="text-xs text-orange-600">Deployed items cannot be edited</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reason for Change */}
          <div>
            <Label htmlFor="reason">Reason for Change *</Label>
            <Input
              id="reason"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="e.g., Received new shipment, equipment damaged, inventory count correction..."
              className="mt-1"
            />
          </div>

          {/* Recent Changes History */}
          {auditHistory.length > 0 && (
            <div>
              <Label className="text-base font-medium flex items-center gap-2">
                <History className="h-4 w-4" />
                Recent Quantity Changes
              </Label>
              <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                {auditHistory.map(entry => {
                  const formatted = formatAuditEntry(entry);
                  return (
                    <div key={entry.id} className="text-xs p-2 bg-gray-50 rounded">
                      <div className="flex justify-between items-start">
                        <span>{formatted.formattedAction}</span>
                        <span className="text-gray-500">{entry.timestamp.toLocaleDateString()}</span>
                      </div>
                      {entry.details.reason && (
                        <div className="text-gray-600 mt-1">Reason: {entry.details.reason}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button 
              onClick={() => {
                setIsDialogOpen(false);
                setEditedQuantities({});
                setChangeReason('');
              }} 
              variant="outline" 
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentQuantityEditor;
