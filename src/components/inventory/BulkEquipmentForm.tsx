
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Clock } from 'lucide-react';
import { StorageLocation } from '@/types/inventory';

interface BulkEquipmentFormProps {
  isBulkCreateOpen: boolean;
  setIsBulkCreateOpen: (open: boolean) => void;
  bulkCreateData: {
    count: number;
    prefix: string;
    startNumber: number;
    locationId: string;
  };
  setBulkCreateData: (data: any) => void;
  storageLocations: StorageLocation[];
  equipmentTypeName: string;
  onBulkCreate: (saveImmediate?: boolean) => void;
}

const BulkEquipmentForm: React.FC<BulkEquipmentFormProps> = ({
  isBulkCreateOpen,
  setIsBulkCreateOpen,
  bulkCreateData,
  setBulkCreateData,
  storageLocations,
  equipmentTypeName,
  onBulkCreate,
}) => {
  return (
    <Dialog open={isBulkCreateOpen} onOpenChange={setIsBulkCreateOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Bulk Create
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Create {equipmentTypeName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Count</Label>
              <Input
                type="number"
                min="1"
                value={bulkCreateData.count}
                onChange={(e) => setBulkCreateData({...bulkCreateData, count: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label>Start Number</Label>
              <Input
                type="number"
                min="1"
                value={bulkCreateData.startNumber}
                onChange={(e) => setBulkCreateData({...bulkCreateData, startNumber: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>
          <div>
            <Label>ID Prefix</Label>
            <Input
              value={bulkCreateData.prefix}
              onChange={(e) => setBulkCreateData({...bulkCreateData, prefix: e.target.value})}
              placeholder="e.g., SS-, SL-, CC-"
            />
          </div>
          <div>
            <Label>Location</Label>
            <Select value={bulkCreateData.locationId} onValueChange={(value) => setBulkCreateData({...bulkCreateData, locationId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {storageLocations.map(location => (
                  <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => onBulkCreate(false)} variant="outline" className="flex-1">
              <Clock className="mr-2 h-4 w-4" />
              Add to Drafts
            </Button>
            <Button onClick={() => onBulkCreate(true)} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Create & Save Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkEquipmentForm;
