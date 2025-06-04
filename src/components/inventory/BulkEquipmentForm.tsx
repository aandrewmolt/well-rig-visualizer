
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, Clock } from 'lucide-react';
import { StorageLocation, EquipmentType } from '@/types/inventory';

interface BulkEquipmentFormProps {
  isBulkCreateOpen: boolean;
  setIsBulkCreateOpen: (open: boolean) => void;
  bulkCreateData: {
    count: number;
    prefix: string;
    startNumber: number;
    locationId: string;
    selectedPrefix?: string;
  };
  setBulkCreateData: (data: any) => void;
  storageLocations: StorageLocation[];
  equipmentType: EquipmentType;
  onBulkCreate: (saveImmediate?: boolean) => void;
}

const BulkEquipmentForm: React.FC<BulkEquipmentFormProps> = ({
  isBulkCreateOpen,
  setIsBulkCreateOpen,
  bulkCreateData,
  setBulkCreateData,
  storageLocations,
  equipmentType,
  onBulkCreate,
}) => {
  const showPrefixSelector = equipmentType.name === 'Company Computer';
  const prefixOptions = showPrefixSelector ? [
    { value: 'CC', label: 'CC - Customer Computer' },
    { value: 'CT', label: 'CT - Customer Tablet' }
  ] : [];

  const handleBulkCreateClick = async (saveImmediate: boolean) => {
    try {
      await onBulkCreate(saveImmediate);
    } catch (error) {
      console.error('Error creating bulk equipment:', error);
    }
  };

  return (
    <Dialog open={isBulkCreateOpen} onOpenChange={setIsBulkCreateOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Bulk Create
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Create {equipmentType.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {showPrefixSelector && (
            <div>
              <Label>Device Type</Label>
              <Select 
                value={bulkCreateData.selectedPrefix || 'CC'} 
                onValueChange={(value) => setBulkCreateData({...bulkCreateData, selectedPrefix: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  {prefixOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <Label>Count *</Label>
            <Input
              type="number"
              value={bulkCreateData.count}
              onChange={(e) => setBulkCreateData({...bulkCreateData, count: parseInt(e.target.value) || 1})}
              min="1"
              max="50"
            />
          </div>
          
          <div>
            <Label>Starting Number</Label>
            <Input
              type="number"
              value={bulkCreateData.startNumber}
              onChange={(e) => setBulkCreateData({...bulkCreateData, startNumber: parseInt(e.target.value) || 1})}
              min="1"
            />
          </div>
          
          <div>
            <Label>Location *</Label>
            <Select 
              value={bulkCreateData.locationId} 
              onValueChange={(value) => setBulkCreateData({...bulkCreateData, locationId: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {storageLocations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button 
              onClick={() => handleBulkCreateClick(false)} 
              variant="outline" 
              className="flex-1"
              disabled={!bulkCreateData.locationId || bulkCreateData.count <= 0}
            >
              <Clock className="mr-2 h-4 w-4" />
              Add to Drafts
            </Button>
            <Button 
              onClick={() => handleBulkCreateClick(true)} 
              className="flex-1"
              disabled={!bulkCreateData.locationId || bulkCreateData.count <= 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkEquipmentForm;
