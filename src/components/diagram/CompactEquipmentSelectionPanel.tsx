
import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Satellite, Square, Plus, X } from 'lucide-react';
import { useTrackedEquipment } from '@/hooks/useTrackedEquipment';
import { TrackedEquipment } from '@/types/equipment';

interface CompactEquipmentSelectionPanelProps {
  selectedShearstreamBoxes: string[];
  selectedStarlink?: string;
  selectedCompanyComputers: string[];
  companyComputerCount: number;
  shearstreamBoxCount: number;
  onEquipmentSelect: (type: 'shearstream-box' | 'starlink' | 'company-computer', equipmentId: string, index?: number) => void;
  onAddShearstreamBox: () => void;
  onRemoveShearstreamBox: (index: number) => void;
  hasWellsideGauge: boolean;
}

const CompactEquipmentSelectionPanel: React.FC<CompactEquipmentSelectionPanelProps> = ({
  selectedShearstreamBoxes,
  selectedStarlink,
  selectedCompanyComputers,
  companyComputerCount,
  shearstreamBoxCount,
  onEquipmentSelect,
  onAddShearstreamBox,
  onRemoveShearstreamBox,
  hasWellsideGauge,
}) => {
  const { getAvailableEquipment, trackedEquipment } = useTrackedEquipment();

  const availableEquipment = useMemo(() => {
    return {
      ssBoxes: getAvailableEquipment('shearstream-box'),
      starlinks: getAvailableEquipment('starlink'),
      computers: getAvailableEquipment('company-computer'),
    };
  }, [getAvailableEquipment]);

  const getEquipmentDisplay = (equipment: TrackedEquipment) => {
    // Standardize display format for consistent labeling
    const formatId = (id: string) => {
      if (equipment.name.toLowerCase().includes('computer')) {
        return `CC-${id.padStart(3, '0')}`;
      }
      return `${id} - ${equipment.name}`;
    };

    return (
      <div className="flex items-center justify-between w-full">
        <span className="truncate text-xs">{formatId(equipment.equipmentId)}</span>
        <Badge variant={equipment.status === 'available' ? 'default' : 'secondary'} className="ml-1 text-xs">
          {equipment.status}
        </Badge>
      </div>
    );
  };

  const getSelectedEquipment = (equipmentId: string) => {
    return trackedEquipment.find(eq => eq.id === equipmentId);
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Square className="h-4 w-4" />
          Equipment Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* ShearStream Boxes - Compact */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Square className="h-3 w-3" />
              <Label className="text-xs font-medium">
                SS Boxes ({availableEquipment.ssBoxes.length}/{shearstreamBoxCount})
              </Label>
            </div>
            <Button
              onClick={onAddShearstreamBox}
              size="sm"
              variant="outline"
              className="h-5 w-5 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          {Array.from({ length: shearstreamBoxCount }, (_, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Box {index + 1}</Label>
                {shearstreamBoxCount > 1 && (
                  <Button
                    onClick={() => onRemoveShearstreamBox(index)}
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Select
                value={selectedShearstreamBoxes[index] || ''}
                onValueChange={(value) => onEquipmentSelect('shearstream-box', value, index)}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {availableEquipment.ssBoxes
                    .filter(eq => !selectedShearstreamBoxes.includes(eq.id) || selectedShearstreamBoxes[index] === eq.id)
                    .length === 0 ? (
                    <SelectItem value="none" disabled>No boxes available</SelectItem>
                  ) : (
                    availableEquipment.ssBoxes
                      .filter(eq => !selectedShearstreamBoxes.includes(eq.id) || selectedShearstreamBoxes[index] === eq.id)
                      .map(equipment => (
                        <SelectItem key={equipment.id} value={equipment.id}>
                          {getEquipmentDisplay(equipment)}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {/* Starlink - Compact */}
        {hasWellsideGauge && (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Satellite className="h-3 w-3" />
              <Label className="text-xs font-medium">Starlink ({availableEquipment.starlinks.length})</Label>
            </div>
            <Select
              value={selectedStarlink || ''}
              onValueChange={(value) => onEquipmentSelect('starlink', value)}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {availableEquipment.starlinks.length === 0 ? (
                  <SelectItem value="none" disabled>No Starlinks available</SelectItem>
                ) : (
                  availableEquipment.starlinks.map(equipment => (
                    <SelectItem key={equipment.id} value={equipment.id}>
                      {getEquipmentDisplay(equipment)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Company Computers - Compact */}
        {companyComputerCount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Monitor className="h-3 w-3" />
              <Label className="text-xs font-medium">Computers ({availableEquipment.computers.length}/{companyComputerCount})</Label>
            </div>
            {Array.from({ length: companyComputerCount }, (_, index) => (
              <div key={index} className="space-y-1">
                <Label className="text-xs">CC-{(index + 1).toString().padStart(3, '0')}</Label>
                <Select
                  value={selectedCompanyComputers[index] || ''}
                  onValueChange={(value) => onEquipmentSelect('company-computer', value, index)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEquipment.computers
                      .filter(eq => !selectedCompanyComputers.includes(eq.id) || selectedCompanyComputers[index] === eq.id)
                      .length === 0 ? (
                      <SelectItem value="none" disabled>No computers available</SelectItem>
                    ) : (
                      availableEquipment.computers
                        .filter(eq => !selectedCompanyComputers.includes(eq.id) || selectedCompanyComputers[index] === eq.id)
                        .map(equipment => (
                          <SelectItem key={equipment.id} value={equipment.id}>
                            {getEquipmentDisplay(equipment)}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompactEquipmentSelectionPanel;
