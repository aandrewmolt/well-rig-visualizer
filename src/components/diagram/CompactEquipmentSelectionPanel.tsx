
import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Satellite, Square, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { IndividualEquipment } from '@/types/inventory';

interface CompactEquipmentSelectionPanelProps {
  selectedShearstreamBoxes: string[];
  selectedStarlink?: string;
  selectedCustomerComputers: string[];
  customerComputerCount: number;
  shearstreamBoxCount: number;
  onEquipmentSelect: (type: 'shearstream-box' | 'starlink' | 'customer-computer', equipmentId: string, index?: number) => void;
  onAddShearstreamBox: () => void;
  onRemoveShearstreamBox: (index: number) => void;
  hasWellsideGauge: boolean;
}

const CompactEquipmentSelectionPanel: React.FC<CompactEquipmentSelectionPanelProps> = ({
  selectedShearstreamBoxes,
  selectedStarlink,
  selectedCustomerComputers,
  customerComputerCount,
  shearstreamBoxCount,
  onEquipmentSelect,
  onAddShearstreamBox,
  onRemoveShearstreamBox,
  hasWellsideGauge,
}) => {
  const { data } = useInventory();

  const availableEquipment = useMemo(() => {
    const available = data.individualEquipment.filter(eq => eq.status === 'available');
    
    return {
      ssBoxes: available.filter(eq => eq.equipmentId.startsWith('SS')),
      starlinks: available.filter(eq => eq.equipmentId.startsWith('SL')),
      computers: available.filter(eq => eq.equipmentId.startsWith('CC') || eq.equipmentId.startsWith('CT')),
    };
  }, [data.individualEquipment]);

  const getEquipmentDisplay = (equipment: IndividualEquipment) => (
    <div className="flex items-center justify-between w-full">
      <span className="truncate text-xs font-medium">{equipment.equipmentId}</span>
      <Badge 
        variant={equipment.status === 'available' ? 'default' : 'secondary'} 
        className={`ml-1 text-xs ${equipment.status === 'available' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-800 border-gray-300'}`}
      >
        <div className={`w-2 h-2 rounded-full mr-1 ${equipment.status === 'available' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
        {equipment.status}
      </Badge>
    </div>
  );

  const getSelectedEquipment = (equipmentId: string) => {
    return data.individualEquipment.find(eq => eq.id === equipmentId);
  };

  return (
    <Card className="bg-gradient-to-br from-white to-indigo-50/30 shadow-lg border-indigo-200/50">
      <CardHeader className="pb-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <div className="p-1.5 bg-white/20 rounded-md">
            <Square className="h-4 w-4" />
          </div>
          Equipment Assignment
          <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-white/30">
            {shearstreamBoxCount + customerComputerCount + (hasWellsideGauge ? 1 : 0)} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* ShearStream Boxes - Enhanced */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-100 rounded">
                <Square className="h-3 w-3 text-blue-600" />
              </div>
              <Label className="text-xs font-semibold text-blue-800">
                SS Boxes ({availableEquipment.ssBoxes.length} available)
              </Label>
            </div>
            <Button
              onClick={onAddShearstreamBox}
              size="sm"
              variant="outline"
              className="h-6 w-6 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          {Array.from({ length: shearstreamBoxCount }, (_, index) => (
            <div key={index} className="space-y-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${selectedShearstreamBoxes[index] ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <Label className="text-xs font-medium text-gray-700">Box {index + 1}</Label>
                  {selectedShearstreamBoxes[index] && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </div>
                {shearstreamBoxCount > 1 && (
                  <Button
                    onClick={() => onRemoveShearstreamBox(index)}
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 text-red-500 hover:bg-red-50"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Select
                value={selectedShearstreamBoxes[index] || ''}
                onValueChange={(value) => onEquipmentSelect('shearstream-box', value, index)}
              >
                <SelectTrigger className="h-8 text-xs border-2 border-gray-200 hover:border-blue-300 focus:border-blue-400 transition-all duration-200">
                  <SelectValue placeholder="Select SS Box..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-gray-100 shadow-xl">
                  {availableEquipment.ssBoxes
                    .filter(eq => !selectedShearstreamBoxes.includes(eq.id) || selectedShearstreamBoxes[index] === eq.id)
                    .length === 0 ? (
                    <SelectItem value="none" disabled className="text-gray-400">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-red-400" />
                        No boxes available
                      </div>
                    </SelectItem>
                  ) : (
                    availableEquipment.ssBoxes
                      .filter(eq => !selectedShearstreamBoxes.includes(eq.id) || selectedShearstreamBoxes[index] === eq.id)
                      .map(equipment => (
                        <SelectItem key={equipment.id} value={equipment.id} className="hover:bg-blue-50">
                          {getEquipmentDisplay(equipment)}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {/* Starlink - Enhanced */}
        {hasWellsideGauge && (
          <div className="space-y-2 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-orange-100 rounded">
                <Satellite className="h-3 w-3 text-orange-600" />
              </div>
              <Label className="text-xs font-semibold text-orange-800">
                Starlink ({availableEquipment.starlinks.length} available)
              </Label>
              {selectedStarlink && (
                <CheckCircle className="h-3 w-3 text-green-500 ml-auto" />
              )}
            </div>
            <Select
              value={selectedStarlink || ''}
              onValueChange={(value) => onEquipmentSelect('starlink', value)}
            >
              <SelectTrigger className="h-8 text-xs border-2 border-orange-200 hover:border-orange-300 focus:border-orange-400 transition-all duration-200 bg-white">
                <SelectValue placeholder="Select Starlink..." />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-100 shadow-xl">
                {availableEquipment.starlinks.length === 0 ? (
                  <SelectItem value="none" disabled className="text-gray-400">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-red-400" />
                      No Starlinks available
                    </div>
                  </SelectItem>
                ) : (
                  availableEquipment.starlinks.map(equipment => (
                    <SelectItem key={equipment.id} value={equipment.id} className="hover:bg-orange-50">
                      {getEquipmentDisplay(equipment)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Customer Computers - Enhanced */}
        {customerComputerCount > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
              <div className="p-1 bg-purple-100 rounded">
                <Monitor className="h-3 w-3 text-purple-600" />
              </div>
              <Label className="text-xs font-semibold text-purple-800">
                Customer Computers ({availableEquipment.computers.length} available)
              </Label>
            </div>
            {Array.from({ length: customerComputerCount }, (_, index) => (
              <div key={index} className="space-y-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-all duration-200">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${selectedCustomerComputers[index] ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <Label className="text-xs font-medium text-gray-700">Computer {index + 1}</Label>
                  {selectedCustomerComputers[index] && (
                    <CheckCircle className="h-3 w-3 text-green-500 ml-auto" />
                  )}
                </div>
                <Select
                  value={selectedCustomerComputers[index] || ''}
                  onValueChange={(value) => onEquipmentSelect('customer-computer', value, index)}
                >
                  <SelectTrigger className="h-8 text-xs border-2 border-gray-200 hover:border-purple-300 focus:border-purple-400 transition-all duration-200">
                    <SelectValue placeholder="Select Computer..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-100 shadow-xl">
                    {availableEquipment.computers
                      .filter(eq => !selectedCustomerComputers.includes(eq.id) || selectedCustomerComputers[index] === eq.id)
                      .length === 0 ? (
                      <SelectItem value="none" disabled className="text-gray-400">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-3 w-3 text-red-400" />
                          No computers available
                        </div>
                      </SelectItem>
                    ) : (
                      availableEquipment.computers
                        .filter(eq => !selectedCustomerComputers.includes(eq.id) || selectedCustomerComputers[index] === eq.id)
                        .map(equipment => (
                          <SelectItem key={equipment.id} value={equipment.id} className="hover:bg-purple-50">
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
