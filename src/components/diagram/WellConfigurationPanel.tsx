
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge } from 'lucide-react';
import { Node } from '@xyflow/react';

interface WellConfigurationPanelProps {
  wellNodes: Node[];
  wellsideGaugeNode?: Node;
  updateWellName: (wellId: string, newName: string) => void;
  updateWellColor: (wellId: string, newColor: string) => void;
  updateWellsideGaugeName: (newName: string) => void;
  updateWellsideGaugeColor: (newColor: string) => void;
}

const WellConfigurationPanel: React.FC<WellConfigurationPanelProps> = ({
  wellNodes,
  wellsideGaugeNode,
  updateWellName,
  updateWellColor,
  updateWellsideGaugeName,
  updateWellsideGaugeColor,
}) => {
  if (wellNodes.length === 0 && !wellsideGaugeNode) {
    return null;
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Well & Gauge Configuration</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
          {wellsideGaugeNode && (
            <div className="flex items-center gap-2 p-2 border rounded bg-orange-50">
              <div className="flex-1">
                <Label htmlFor="wellside-gauge-name-config" className="text-xs flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  Gauge Name
                </Label>
                <Input
                  id="wellside-gauge-name-config"
                  value={wellsideGaugeNode.data.label}
                  onChange={(e) => updateWellsideGaugeName(e.target.value)}
                  className="h-7 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="wellside-gauge-color" className="text-xs">Color</Label>
                <Select
                  value={wellsideGaugeNode.data.color}
                  onValueChange={(color) => updateWellsideGaugeColor(color)}
                >
                  <SelectTrigger id="wellside-gauge-color" className="w-20 h-7">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: wellsideGaugeNode.data.color }}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#f59e0b">Orange</SelectItem>
                    <SelectItem value="#3b82f6">Blue</SelectItem>
                    <SelectItem value="#ef4444">Red</SelectItem>
                    <SelectItem value="#10b981">Green</SelectItem>
                    <SelectItem value="#8b5cf6">Purple</SelectItem>
                    <SelectItem value="#06b6d4">Cyan</SelectItem>
                    <SelectItem value="#eab308">Yellow</SelectItem>
                    <SelectItem value="#ffffff">White</SelectItem>
                    <SelectItem value="#000000">Black</SelectItem>
                    <SelectItem value="#6b7280">Grey</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {wellNodes.map((wellNode) => (
            <div key={wellNode.id} className="flex items-center gap-2 p-2 border rounded">
              <div className="flex-1">
                <Label htmlFor={`well-name-${wellNode.id}`} className="text-xs">Well Name</Label>
                <Input
                  id={`well-name-${wellNode.id}`}
                  value={wellNode.data.label}
                  onChange={(e) => updateWellName(wellNode.id, e.target.value)}
                  className="h-7 text-sm"
                />
              </div>
              <div>
                <Label htmlFor={`well-color-${wellNode.id}`} className="text-xs">Color</Label>
                <Select
                  value={wellNode.data.color}
                  onValueChange={(color) => updateWellColor(wellNode.id, color)}
                >
                  <SelectTrigger id={`well-color-${wellNode.id}`} className="w-20 h-7">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: wellNode.data.color }}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#3b82f6">Blue</SelectItem>
                    <SelectItem value="#ef4444">Red</SelectItem>
                    <SelectItem value="#10b981">Green</SelectItem>
                    <SelectItem value="#f59e0b">Orange</SelectItem>
                    <SelectItem value="#8b5cf6">Purple</SelectItem>
                    <SelectItem value="#06b6d4">Cyan</SelectItem>
                    <SelectItem value="#eab308">Yellow</SelectItem>
                    <SelectItem value="#ffffff">White</SelectItem>
                    <SelectItem value="#000000">Black</SelectItem>
                    <SelectItem value="#6b7280">Grey</SelectItem>
                    <SelectItem value="#84cc16">Lime</SelectItem>
                    <SelectItem value="#ec4899">Pink</SelectItem>
                    <SelectItem value="#f97316">Dark Orange</SelectItem>
                    <SelectItem value="#14b8a6">Teal</SelectItem>
                    <SelectItem value="#a855f7">Violet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WellConfigurationPanel;
