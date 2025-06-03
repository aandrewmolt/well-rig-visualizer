
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Package, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { Node } from '@xyflow/react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useRobustEquipmentTracking } from '@/hooks/useRobustEquipmentTracking';

interface CompactJobEquipmentPanelProps {
  jobId: string;
  jobName: string;
  nodes: Node[];
  edges: any[];
}

const CompactJobEquipmentPanel: React.FC<CompactJobEquipmentPanelProps> = ({
  jobId,
  jobName,
  nodes,
  edges,
}) => {
  const { data } = useSupabaseInventory();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  
  const {
    performComprehensiveAllocation,
    returnAllJobEquipment,
    analyzeEquipmentUsage,
    validateInventoryConsistency,
  } = useRobustEquipmentTracking(jobId, nodes, edges);

  const equipmentUsage = analyzeEquipmentUsage();
  const deployedItems = data.equipmentItems.filter(
    item => item.status === 'deployed' && item.jobId === jobId
  );

  const handleAllocateEquipment = () => {
    if (!selectedLocation) return;
    performComprehensiveAllocation(selectedLocation);
  };

  const getLocationName = (locationId: string) => {
    return data.storageLocations.find(loc => loc.id === locationId)?.name || 'Unknown Location';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="h-4 w-4" />
          Equipment Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Location Selection */}
        <div>
          <label className="text-xs font-medium mb-1 block">Equipment Location</label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select location..." />
            </SelectTrigger>
            <SelectContent>
              {data.storageLocations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Equipment Requirements */}
        <div>
          <h4 className="text-xs font-medium mb-2">Required from Diagram</h4>
          <div className="space-y-1">
            {Object.entries(equipmentUsage.cables).map(([typeId, details]) => (
              <div key={typeId} className="flex justify-between text-xs">
                <span className="truncate">{details.typeName}:</span>
                <Badge variant="secondary" className="text-xs h-5">{details.quantity}</Badge>
              </div>
            ))}
            {equipmentUsage.gauges > 0 && (
              <div className="flex justify-between text-xs">
                <span>Pressure Gauges:</span>
                <Badge variant="secondary" className="text-xs h-5">{equipmentUsage.gauges}</Badge>
              </div>
            )}
            {equipmentUsage.adapters > 0 && (
              <div className="flex justify-between text-xs">
                <span>Y Adapters:</span>
                <Badge variant="secondary" className="text-xs h-5">{equipmentUsage.adapters}</Badge>
              </div>
            )}
            {equipmentUsage.computers > 0 && (
              <div className="flex justify-between text-xs">
                <span>Computers:</span>
                <Badge variant="secondary" className="text-xs h-5">{equipmentUsage.computers}</Badge>
              </div>
            )}
            {equipmentUsage.satellite > 0 && (
              <div className="flex justify-between text-xs">
                <span>Satellite:</span>
                <Badge variant="secondary" className="text-xs h-5">{equipmentUsage.satellite}</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Deployed Equipment Status */}
        {deployedItems.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Currently Deployed
            </h4>
            <div className="space-y-1">
              {deployedItems.map((item) => {
                const equipmentType = data.equipmentTypes.find(type => type.id === item.typeId);
                return (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="truncate">{equipmentType?.name || 'Unknown'}:</span>
                    <Badge className="text-xs h-5 bg-green-100 text-green-800">{item.quantity}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button
            onClick={handleAllocateEquipment}
            disabled={!selectedLocation}
            size="sm"
            className="w-full h-7 text-xs"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Allocate Equipment
          </Button>
          
          {deployedItems.length > 0 && (
            <Button
              onClick={returnAllJobEquipment}
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs"
            >
              Return All Equipment
            </Button>
          )}
          
          <Button
            onClick={validateInventoryConsistency}
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs"
          >
            <AlertTriangle className="mr-1 h-3 w-3" />
            Validate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactJobEquipmentPanel;
