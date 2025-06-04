
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Clock } from 'lucide-react';
import { StorageLocation, EquipmentType } from '@/types/inventory';
import { useEquipmentIdGenerator } from '@/hooks/inventory/useEquipmentIdGenerator';

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
  const { generateEquipmentId, getIdFormat } = useEquipmentIdGenerator();
  
  // Show prefix selector for Company Computer types
  const showPrefixSelector = equipmentType.name === 'Company Computer';
  const prefixOptions = showPrefixSelector ? [
    { value: 'CC', label: 'CC - Customer Computer' },
    { value: 'CT', label: 'CT - Customer Tablet' }
  ] : [];

  // Use selected prefix or default equipment type prefix
  const currentPrefix = showPrefixSelector 
    ? (bulkCreateData.selectedPrefix || 'CC')
    : equipmentType.defaultIdPrefix || '';
  
  // Create a temporary equipment type with the selected prefix for ID generation
  const tempEquipmentType = showPrefixSelector 
    ? { ...equipmentType, defaultIdPrefix: currentPrefix }
    : equipmentType;
  
  const exampleId = generateEquipmentId(tempEquipmentType, bulkCreateData.startNumber);
  const idFormat = getIdFormat(tempEquipmentType);

  const handlePrefixChange = (prefix: string) => {
    setBulkCreateData({...bulkCreateData, selectedPrefix: prefix});
  };

  return (
    <Dialog open={isBulkCreateOpen} onOpenChange={setIsBulkCreateOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Bulk Create
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Create {equipmentType.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {showPrefixSelector && (
            <div>
              <Label>Equipment Type</Label>
              <Select 
                value={bulkCreateData.selectedPrefix || 'CC'} 
                onValueChange={handlePrefixChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment type" />
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
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-700">
              <strong>ID Format:</strong> {idFormat} (e.g., {exampleId})
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Will create: {exampleId} to {generateEquipmentId(tempEquipmentType, bulkCreateData.startNumber + bulkCreateData.count - 1)}
            </p>
          </div>
          
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
