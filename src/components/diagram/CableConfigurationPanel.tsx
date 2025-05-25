
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Route, Square, Download, Monitor } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';

interface CableConfigurationPanelProps {
  selectedCableType: string;
  setSelectedCableType: (type: string) => void;
  addYAdapter: () => void;
  addCompanyComputer: () => void;
  clearDiagram: () => void;
  saveDiagram: () => void;
}

const CableConfigurationPanel: React.FC<CableConfigurationPanelProps> = ({
  selectedCableType,
  setSelectedCableType,
  addYAdapter,
  addCompanyComputer,
  clearDiagram,
  saveDiagram,
}) => {
  const { data } = useInventoryData();

  // Get available cable types from inventory
  const availableCables = data.equipmentTypes
    .filter(type => type.category === 'cables')
    .map(cableType => {
      const availableItems = data.equipmentItems
        .filter(item => 
          item.typeId === cableType.id && 
          item.status === 'available' && 
          item.quantity > 0
        );
      
      const totalQuantity = availableItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        id: cableType.id,
        name: cableType.name,
        availableQuantity: totalQuantity,
      };
    })
    .filter(cable => cable.availableQuantity > 0); // Only show cables with available quantity

  const selectedCableName = availableCables.find(cable => cable.id === selectedCableType)?.name || '';

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Route className="h-4 w-4" />
          Cable Configuration Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
          <div>
            <Label htmlFor="cable-type" className="text-sm">Cable Type</Label>
            <Select value={selectedCableType} onValueChange={setSelectedCableType}>
              <SelectTrigger id="cable-type" className="h-8">
                <SelectValue placeholder="Select cable type..." />
              </SelectTrigger>
              <SelectContent>
                {availableCables.length === 0 ? (
                  <SelectItem value="none" disabled>No cables available</SelectItem>
                ) : (
                  availableCables.map(cable => (
                    <SelectItem key={cable.id} value={cable.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{cable.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({cable.availableQuantity} available)</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedCableName && (
              <div className="text-xs text-gray-600 mt-1">
                Selected: {selectedCableName}
              </div>
            )}
          </div>
          
          <Button onClick={addYAdapter} variant="outline" size="sm" className="flex items-center gap-2 h-8">
            <Square className="h-3 w-3" />
            Add Y Adapter
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button onClick={addCompanyComputer} variant="outline" size="sm" className="flex items-center gap-2 h-8">
            <Monitor className="h-3 w-3" />
            Add Computer
          </Button>
          
          <Button onClick={clearDiagram} variant="outline" size="sm" className="h-8">
            Clear Diagram
          </Button>
        </div>

        <div className="flex justify-center">
          <Button onClick={saveDiagram} size="sm" className="bg-green-600 hover:bg-green-700 flex items-center gap-2 h-8">
            <Download className="h-3 w-3" />
            Save Diagram
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CableConfigurationPanel;
