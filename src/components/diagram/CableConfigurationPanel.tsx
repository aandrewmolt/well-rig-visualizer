
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Route, Square, Download } from 'lucide-react';

interface CableConfigurationPanelProps {
  selectedCableType: '100ft' | '200ft' | '300ft';
  setSelectedCableType: (type: '100ft' | '200ft' | '300ft') => void;
  mainBoxName: string;
  updateMainBoxName: (name: string) => void;
  companyComputerName: string;
  updateCompanyComputerName: (name: string) => void;
  satelliteName: string;
  updateSatelliteName: (name: string) => void;
  wellsideGaugeName: string;
  updateWellsideGaugeName: (name: string) => void;
  hasWellsideGauge: boolean;
  addYAdapter: () => void;
  clearDiagram: () => void;
  saveDiagram: () => void;
}

const CableConfigurationPanel: React.FC<CableConfigurationPanelProps> = ({
  selectedCableType,
  setSelectedCableType,
  mainBoxName,
  updateMainBoxName,
  companyComputerName,
  updateCompanyComputerName,
  satelliteName,
  updateSatelliteName,
  wellsideGaugeName,
  updateWellsideGaugeName,
  hasWellsideGauge,
  addYAdapter,
  clearDiagram,
  saveDiagram,
}) => {
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
            <Select value={selectedCableType} onValueChange={(value: any) => setSelectedCableType(value)}>
              <SelectTrigger id="cable-type" className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100ft">100ft Cable</SelectItem>
                <SelectItem value="200ft">200ft Cable</SelectItem>
                <SelectItem value="300ft">300ft Reel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={addYAdapter} variant="outline" size="sm" className="flex items-center gap-2 h-8">
            <Square className="h-3 w-3" />
            Add Y Adapter
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button onClick={clearDiagram} variant="outline" size="sm" className="h-8">
            Clear Diagram
          </Button>
          
          <Button onClick={saveDiagram} size="sm" className="bg-green-600 hover:bg-green-700 flex items-center gap-2 h-8">
            <Download className="h-3 w-3" />
            Save Diagram
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div>
            <Label htmlFor="main-box-name" className="text-sm">Main Box Name</Label>
            <Input
              id="main-box-name"
              value={mainBoxName}
              onChange={(e) => updateMainBoxName(e.target.value)}
              placeholder="SS001"
              className="h-8"
            />
          </div>
          
          <div>
            <Label htmlFor="computer-name" className="text-sm">Company Computer</Label>
            <Input
              id="computer-name"
              value={companyComputerName}
              onChange={(e) => updateCompanyComputerName(e.target.value)}
              placeholder="Company Computer"
              className="h-8"
            />
          </div>
          
          <div>
            <Label htmlFor="satellite-name" className="text-sm">Satellite Name</Label>
            <Input
              id="satellite-name"
              value={satelliteName}
              onChange={(e) => updateSatelliteName(e.target.value)}
              placeholder="Starlink"
              className="h-8"
            />
          </div>

          {hasWellsideGauge && (
            <div>
              <Label htmlFor="wellside-gauge-name" className="text-sm">Wellside Gauge Name</Label>
              <Input
                id="wellside-gauge-name"
                value={wellsideGaugeName}
                onChange={(e) => updateWellsideGaugeName(e.target.value)}
                placeholder="Wellside Gauge"
                className="h-8"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CableConfigurationPanel;
