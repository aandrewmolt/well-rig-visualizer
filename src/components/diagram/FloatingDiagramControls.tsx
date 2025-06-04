
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Zap, Satellite, Monitor } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';

interface FloatingDiagramControlsProps {
  selectedCableType: string;
  setSelectedCableType: (type: string) => void;
  addYAdapter: () => void;
  onAddShearstreamBox: () => void;
  addCustomerComputer: () => void;
}

const FloatingDiagramControls: React.FC<FloatingDiagramControlsProps> = ({
  selectedCableType,
  setSelectedCableType,
  addYAdapter,
  onAddShearstreamBox,
  addCustomerComputer,
}) => {
  const { data: inventoryData } = useInventoryData();

  const availableCables = inventoryData.equipmentTypes
    .filter(type => type.category === 'cables')
    .filter(cableType => {
      const availableItems = inventoryData.equipmentItems
        .filter(item => 
          item.typeId === cableType.id && 
          item.status === 'available' && 
          item.quantity > 0
        );
      return availableItems.length > 0;
    });

  return (
    <Card className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-sm border shadow-lg">
      <CardContent className="p-3 space-y-2">
        <div className="text-xs font-medium text-gray-600 mb-2">Quick Controls</div>
        
        {/* Cable Type Selector */}
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Cable Type</label>
          <Select value={selectedCableType} onValueChange={setSelectedCableType}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="Select cable" />
            </SelectTrigger>
            <SelectContent>
              {availableCables.map((cable) => (
                <SelectItem key={cable.id} value={cable.id} className="text-xs">
                  {cable.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Action Buttons */}
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Add Components</div>
          <div className="grid grid-cols-1 gap-1">
            <Button
              onClick={addYAdapter}
              size="sm"
              variant="outline"
              className="h-8 text-xs justify-start"
            >
              <Zap className="h-3 w-3 mr-1" />
              Y-Adapter
            </Button>
            
            <Button
              onClick={onAddShearstreamBox}
              size="sm"
              variant="outline"
              className="h-8 text-xs justify-start"
            >
              <Plus className="h-3 w-3 mr-1" />
              SS Box
            </Button>
            
            <Button
              onClick={addCustomerComputer}
              size="sm"
              variant="outline"
              className="h-8 text-xs justify-start"
            >
              <Monitor className="h-3 w-3 mr-1" />
              Computer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FloatingDiagramControls;
