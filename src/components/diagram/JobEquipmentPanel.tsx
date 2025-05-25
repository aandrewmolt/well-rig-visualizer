
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, MapPin, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import ExtrasOnLocationPanel from './ExtrasOnLocationPanel';
import { toast } from 'sonner';

interface JobEquipmentPanelProps {
  jobId: string;
  jobName: string;
  equipmentUsage?: {
    cables: { [key: string]: number };
    gauges: number;
    adapters: number;
    computers: number;
    satellite: number;
  };
  extrasOnLocation?: Array<{
    id: string;
    equipmentTypeId: string;
    quantity: number;
    reason: string;
    addedDate: Date;
    notes?: string;
  }>;
  onAutoAllocate?: (locationId: string) => void;
  onAddExtra?: (equipmentTypeId: string, quantity: number, reason: string, notes?: string) => void;
  onRemoveExtra?: (extraId: string) => void;
}

const JobEquipmentPanel: React.FC<JobEquipmentPanelProps> = ({ 
  jobId, 
  jobName, 
  equipmentUsage,
  extrasOnLocation = [],
  onAutoAllocate,
  onAddExtra,
  onRemoveExtra
}) => {
  const { data } = useInventoryData();
  const [selectedLocation, setSelectedLocation] = useState<string>(data.storageLocations[0]?.id || '');
  const [autoAllocationEnabled, setAutoAllocationEnabled] = useState(true);

  const getEquipmentTypeName = (typeId: string) => {
    return data.equipmentTypes.find(type => type.id === typeId)?.name || 'Unknown';
  };

  const getLocationName = (locationId: string) => {
    return data.storageLocations.find(loc => loc.id === locationId)?.name || 'Unknown';
  };

  const getDeployedEquipment = () => {
    return data.equipmentItems.filter(item => item.status === 'deployed' && item.jobId === jobId);
  };

  const getAvailableQuantity = (typeId: string, locationId: string) => {
    return data.equipmentItems
      .filter(item => item.typeId === typeId && item.locationId === locationId && item.status === 'available')
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const checkEquipmentAvailability = () => {
    if (!equipmentUsage || !selectedLocation) return { hasIssues: false, issues: [] };
    
    const issues: string[] = [];
    const typeMapping: { [key: string]: string } = {
      '100ft': '1',
      '200ft': '2',  
      '300ft': '4',
    };

    // Check cables
    Object.entries(equipmentUsage.cables).forEach(([cableType, needed]) => {
      const typeId = typeMapping[cableType];
      if (typeId) {
        const available = getAvailableQuantity(typeId, selectedLocation);
        if (available < needed) {
          issues.push(`${cableType} cables: need ${needed}, have ${available}`);
        }
      }
    });

    // Check other equipment
    if (equipmentUsage.gauges > 0) {
      const available = getAvailableQuantity('7', selectedLocation);
      if (available < equipmentUsage.gauges) {
        issues.push(`Pressure gauges: need ${equipmentUsage.gauges}, have ${available}`);
      }
    }

    if (equipmentUsage.adapters > 0) {
      const available = getAvailableQuantity('9', selectedLocation);
      if (available < equipmentUsage.adapters) {
        issues.push(`Y adapters: need ${equipmentUsage.adapters}, have ${available}`);
      }
    }

    if (equipmentUsage.computers > 0) {
      const available = getAvailableQuantity('11', selectedLocation);
      if (available < equipmentUsage.computers) {
        issues.push(`Company computers: need ${equipmentUsage.computers}, have ${available}`);
      }
    }

    if (equipmentUsage.satellite > 0) {
      const available = getAvailableQuantity('10', selectedLocation);
      if (available < equipmentUsage.satellite) {
        issues.push(`Satellite: need ${equipmentUsage.satellite}, have ${available}`);
      }
    }

    return { hasIssues: issues.length > 0, issues };
  };

  // Auto-allocate when location changes and auto-allocation is enabled
  useEffect(() => {
    if (autoAllocationEnabled && selectedLocation && onAutoAllocate) {
      onAutoAllocate(selectedLocation);
    }
  }, [selectedLocation, autoAllocationEnabled, onAutoAllocate]);

  const deployedEquipment = getDeployedEquipment();
  const availability = checkEquipmentAvailability();

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Job Equipment - {jobName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto-Allocation Toggle */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Auto-Allocation</span>
              <Badge variant={autoAllocationEnabled ? 'default' : 'secondary'}>
                {autoAllocationEnabled ? 'ON' : 'OFF'}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAutoAllocationEnabled(!autoAllocationEnabled)}
            >
              {autoAllocationEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>

          {/* Storage Location Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Equipment Source Location</label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select storage location" />
              </SelectTrigger>
              <SelectContent>
                {data.storageLocations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {location.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Equipment Availability Check */}
          {availability.hasIssues && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Equipment Shortage</span>
              </div>
              <div className="space-y-1">
                {availability.issues.map((issue, index) => (
                  <div key={index} className="text-xs text-red-700">{issue}</div>
                ))}
              </div>
            </div>
          )}

          {/* Equipment Usage Summary */}
          {equipmentUsage && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Required from Diagram
              </h4>
              <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
                {Object.entries(equipmentUsage.cables).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span>{type} Cables:</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
                {equipmentUsage.gauges > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Pressure Gauges:</span>
                    <Badge variant="secondary">{equipmentUsage.gauges}</Badge>
                  </div>
                )}
                {equipmentUsage.adapters > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Y Adapters:</span>
                    <Badge variant="secondary">{equipmentUsage.adapters}</Badge>
                  </div>
                )}
                {equipmentUsage.computers > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Company Computers:</span>
                    <Badge variant="secondary">{equipmentUsage.computers}</Badge>
                  </div>
                )}
                {equipmentUsage.satellite > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Satellite:</span>
                    <Badge variant="secondary">{equipmentUsage.satellite}</Badge>
                  </div>
                )}
                {!autoAllocationEnabled && onAutoAllocate && selectedLocation && (
                  <Button
                    onClick={() => onAutoAllocate(selectedLocation)}
                    size="sm"
                    className="w-full mt-2"
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Manually Allocate Equipment
                  </Button>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Currently Deployed Equipment */}
          <div>
            <h4 className="text-sm font-medium mb-2">Equipment Deployed to Job</h4>
            {deployedEquipment.length === 0 ? (
              <p className="text-sm text-gray-500">No equipment currently deployed</p>
            ) : (
              <div className="space-y-2">
                {deployedEquipment.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{getEquipmentTypeName(item.typeId)}</span>
                        <Badge variant="outline">{item.quantity}x</Badge>
                        <Badge className="text-xs bg-green-100 text-green-800 border-green-300">
                          Deployed
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        From: {getLocationName(item.locationId)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Extras on Location Panel */}
      <ExtrasOnLocationPanel
        extrasOnLocation={extrasOnLocation}
        onAddExtra={onAddExtra || (() => {})}
        onRemoveExtra={onRemoveExtra || (() => {})}
      />
    </div>
  );
};

export default JobEquipmentPanel;
