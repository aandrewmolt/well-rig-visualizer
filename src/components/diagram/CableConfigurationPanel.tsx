
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cable, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';

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
  const { data } = useSupabaseInventory();

  // Filter cable types from equipment types
  const cableTypes = data.equipmentTypes.filter(type => type.category === 'cables');

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Cable className="h-4 w-4" />
          Diagram Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Cable Type Selection */}
        <div>
          <label className="text-xs font-medium mb-1 block">Default Cable Type</label>
          <Select value={selectedCableType} onValueChange={setSelectedCableType}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select cable type..." />
            </SelectTrigger>
            <SelectContent>
              {cableTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add Components */}
        <div>
          <label className="text-xs font-medium mb-1 block">Add Components</label>
          <div className="grid grid-cols-2 gap-1">
            <Button
              onClick={addYAdapter}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
            >
              <Plus className="mr-1 h-3 w-3" />
              Y Adapter
            </Button>
            <Button
              onClick={addCompanyComputer}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
            >
              <Plus className="mr-1 h-3 w-3" />
              Computer
            </Button>
          </div>
        </div>

        {/* Diagram Actions */}
        <div>
          <label className="text-xs font-medium mb-1 block">Diagram Actions</label>
          <div className="grid grid-cols-1 gap-1">
            <Button
              onClick={saveDiagram}
              size="sm"
              className="h-7 text-xs bg-green-600 hover:bg-green-700"
            >
              <Save className="mr-1 h-3 w-3" />
              Save Diagram
            </Button>
            <Button
              onClick={clearDiagram}
              variant="destructive"
              size="sm"
              className="h-7 text-xs"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Clear All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CableConfigurationPanel;
