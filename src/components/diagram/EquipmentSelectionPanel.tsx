
import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Satellite, Square } from 'lucide-react';
import { useTrackedEquipment } from '@/hooks/useTrackedEquipment';
import { TrackedEquipment } from '@/types/equipment';

interface EquipmentSelectionPanelProps {
  selectedShearstreamBox?: string;
  selectedStarlink?: string;
  selectedCompanyComputers: string[];
  companyComputerCount: number;
  onEquipmentSelect: (type: 'shearstream-box' | 'starlink' | 'company-computer', equipmentId: string, index?: number) => void;
  hasWellsideGauge: boolean;
}

const EquipmentSelectionPanel: React.FC<EquipmentSelectionPanelProps> = ({
  selectedShearstreamBox,
  selectedStarlink,
  selectedCompanyComputers,
  companyComputerCount,
  onEquipmentSelect,
  hasWellsideGauge,
}) => {
  const { getAvailableEquipment, trackedEquipment } = useTrackedEquipment();

  // Memoize available equipment to prevent recalculation on every render
  const availableEquipment = useMemo(() => {
    return {
      ssBoxes: getAvailableEquipment('shearstream-box'),
      starlinks: getAvailableEquipment('starlink'),
      computers: getAvailableEquipment('company-computer'),
    };
  }, [getAvailableEquipment]);

  const getEquipmentDisplay = (equipment: TrackedEquipment) => (
    <div className="flex items-center justify-between w-full">
      <span>{equipment.equipmentId} - {equipment.name}</span>
      <Badge variant={equipment.status === 'available' ? 'default' : 'secondary'}>
        {equipment.status}
      </Badge>
    </div>
  );

  const getSelectedEquipment = (equipmentId: string) => {
    return trackedEquipment.find(eq => eq.id === equipmentId);
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Square className="h-4 w-4" />
          Equipment Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* ShearStream Box Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Square className="h-3 w-3" />
            <Label className="text-sm font-medium">ShearStream Box ({availableEquipment.ssBoxes.length} available)</Label>
          </div>
          <Select
            value={selectedShearstreamBox || ''}
            onValueChange={(value) => onEquipmentSelect('shearstream-box', value)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select SS Box..." />
            </SelectTrigger>
            <SelectContent>
              {availableEquipment.ssBoxes.length === 0 ? (
                <SelectItem value="none" disabled>No ShearStream boxes available</SelectItem>
              ) : (
                availableEquipment.ssBoxes.map(equipment => (
                  <SelectItem key={equipment.id} value={equipment.id}>
                    {getEquipmentDisplay(equipment)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {selectedShearstreamBox && (
            <div className="text-xs text-gray-600">
              Selected: {getSelectedEquipment(selectedShearstreamBox)?.equipmentId}
            </div>
          )}
        </div>

        {/* Starlink Selection */}
        {hasWellsideGauge && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Satellite className="h-3 w-3" />
              <Label className="text-sm font-medium">Starlink ({availableEquipment.starlinks.length} available)</Label>
            </div>
            <Select
              value={selectedStarlink || ''}
              onValueChange={(value) => onEquipmentSelect('starlink', value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select Starlink..." />
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
            {selectedStarlink && (
              <div className="text-xs text-gray-600">
                Selected: {getSelectedEquipment(selectedStarlink)?.equipmentId}
              </div>
            )}
          </div>
        )}

        {/* Company Computers Selection */}
        {companyComputerCount > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-3 w-3" />
              <Label className="text-sm font-medium">Company Computers ({availableEquipment.computers.length} available, {companyComputerCount} needed)</Label>
            </div>
            {Array.from({ length: companyComputerCount }, (_, index) => (
              <div key={index} className="space-y-2">
                <Label className="text-xs">Computer {index + 1}</Label>
                <Select
                  value={selectedCompanyComputers[index] || ''}
                  onValueChange={(value) => onEquipmentSelect('company-computer', value, index)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select Computer..." />
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
                {selectedCompanyComputers[index] && (
                  <div className="text-xs text-gray-600">
                    Selected: {getSelectedEquipment(selectedCompanyComputers[index])?.equipmentId}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentSelectionPanel;
