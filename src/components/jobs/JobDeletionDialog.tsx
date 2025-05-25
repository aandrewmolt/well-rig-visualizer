
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, MapPin } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { Badge } from '@/components/ui/badge';

interface JobDeletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (returnLocationId: string) => void;
  jobName: string;
  deployedEquipment: Array<{
    id: string;
    typeId: string;
    quantity: number;
    typeName: string;
  }>;
}

const JobDeletionDialog: React.FC<JobDeletionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  jobName,
  deployedEquipment,
}) => {
  const { data } = useInventoryData();
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  const handleConfirm = () => {
    if (!selectedLocationId) {
      return;
    }
    onConfirm(selectedLocationId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Delete Job: {jobName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This job has equipment currently deployed. Please select where to return the equipment:
          </p>

          {/* Equipment Summary */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-3">Equipment to be returned:</h4>
            <div className="space-y-2">
              {deployedEquipment.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="text-sm">{item.typeName}</span>
                  <Badge variant="secondary">{item.quantity}x</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Location Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Return equipment to:</label>
            <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
              <SelectTrigger>
                <SelectValue placeholder="Select storage location" />
              </SelectTrigger>
              <SelectContent>
                {data.storageLocations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {location.name}
                      {location.isDefault && <Badge variant="outline" className="text-xs">Default</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedLocationId}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Job & Return Equipment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobDeletionDialog;
