
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Route, Square, Download, Monitor, Cable, Zap } from 'lucide-react';
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
    .filter(cable => cable.availableQuantity > 0);

  const selectedCableName = availableCables.find(cable => cable.id === selectedCableType)?.name || '';

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50/30 shadow-lg border-blue-200/50 backdrop-blur-sm">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <div className="p-1.5 bg-white/20 rounded-md">
            <Route className="h-4 w-4" />
          </div>
          Cable Configuration
          <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-white/30">
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Cable Type Selection - Enhanced */}
        <div className="space-y-2">
          <Label htmlFor="cable-type" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Cable className="h-3 w-3 text-blue-600" />
            Cable Type Selection
          </Label>
          <Select value={selectedCableType} onValueChange={setSelectedCableType}>
            <SelectTrigger 
              id="cable-type" 
              className="h-10 border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
            >
              <SelectValue placeholder="Choose cable type..." />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-gray-100 shadow-xl">
              {availableCables.length === 0 ? (
                <SelectItem value="none" disabled className="text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    No cables available
                  </div>
                </SelectItem>
              ) : (
                availableCables.map(cable => (
                  <SelectItem key={cable.id} value={cable.id} className="hover:bg-blue-50">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="font-medium">{cable.name}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="ml-2 bg-green-50 text-green-700 border-green-200"
                      >
                        {cable.availableQuantity} available
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {selectedCableName && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-200">
              <Zap className="h-3 w-3 text-blue-600" />
              <span className="text-sm text-blue-800 font-medium">
                Active: {selectedCableName}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons - Enhanced Grid Layout */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={addYAdapter} 
            variant="outline" 
            className="h-10 flex items-center gap-2 border-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
          >
            <div className="p-1 bg-orange-100 rounded">
              <Square className="h-3 w-3" />
            </div>
            Y Adapter
          </Button>
          
          <Button 
            onClick={addCompanyComputer} 
            variant="outline" 
            className="h-10 flex items-center gap-2 border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
          >
            <div className="p-1 bg-purple-100 rounded">
              <Monitor className="h-3 w-3" />
            </div>
            Computer
          </Button>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <Button 
            onClick={clearDiagram} 
            variant="outline" 
            className="flex-1 h-9 text-gray-600 border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Clear
          </Button>
          
          <Button 
            onClick={saveDiagram} 
            className="flex-1 h-9 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md transition-all duration-200"
          >
            <Download className="h-3 w-3 mr-2" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CableConfigurationPanel;
