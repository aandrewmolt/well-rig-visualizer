
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Package } from 'lucide-react';
import ExtraEquipmentForm from './extras/ExtraEquipmentForm';
import ExtraEquipmentList from './extras/ExtraEquipmentList';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
              <ExtraEquipmentForm
                onAddExtra={onAddExtra}
                onClose={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ExtraEquipmentList
          extrasOnLocation={extrasOnLocation}
          onRemoveExtra={onRemoveExtra}
        />
      </CardContent>
    </Card>
  );
};

export default ExtrasOnLocationPanel;
