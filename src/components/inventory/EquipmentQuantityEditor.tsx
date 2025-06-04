
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { EquipmentItem } from '@/types/inventory';

interface EquipmentQuantityEditorProps {
  equipmentTypeId: string;
  equipmentTypeName: string;
  currentItems: EquipmentItem[];
}

const EquipmentQuantityEditor: React.FC<EquipmentQuantityEditorProps> = ({
  equipmentTypeId,
  equipmentTypeName,
  currentItems,
}) => {
  const { data, addEquipmentItem } = useSupabaseInventory();
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(10);
  const [selectedLocationId, setSelectedLocationId] = useState('');

  const handleSubmit = async () => {
    if (!selectedLocationId) return;

    try {
      await addEquipmentItem({
        typeId: equipmentTypeId,
        locationId: selectedLocationId,
        quantity: quantity,
        status: 'available',
        location_type: 'storage'
      });
      setIsOpen(false);
      setQuantity(10);
      setSelectedLocationId('');
    } catch (error) {
      console.error('Failed to add equipment:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-3 w-3 mr-1" />
          Add Stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {equipmentTypeName} Stock</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
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
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={!selectedLocationId}>
              <Package className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentQuantityEditor;
