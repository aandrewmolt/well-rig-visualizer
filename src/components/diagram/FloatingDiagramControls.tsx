
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
    <Card className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-white/95 backdrop-blur-sm border shadow-lg">
      <CardContent className="p-3">
        <div className="flex items-center gap-4">
          {/* Cable Type Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Cable:</span>
            <Select value={selectedCableType} onValueChange={setSelectedCableType}>
              <SelectTrigger className="h-8 w-32 text-xs">
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

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300" />

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Add:</span>
            
            <Button
              onClick={addYAdapter}
              size="sm"
              variant="outline"
              className="h-8 text-xs px-3"
            >
              <Zap className="h-3 w-3 mr-1" />
              Y-Adapter
            </Button>
            
            <Button
              onClick={onAddShearstreamBox}
              size="sm"
              variant="outline"
              className="h-8 text-xs px-3"
            >
              <Plus className="h-3 w-3 mr-1" />
              SS Box
            </Button>
            
            <Button
              onClick={addCustomerComputer}
              size="sm"
              variant="outline"
              className="h-8 text-xs px-3"
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
