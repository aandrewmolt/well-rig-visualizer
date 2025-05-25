
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, RefreshCw } from 'lucide-react';

interface EquipmentUsage {
  cables: { [key: string]: number };
  gauges: number;
  adapters: number;
  computers: number;
  satellite: number;
}

interface EquipmentUsageSummaryProps {
  equipmentUsage?: EquipmentUsage;
  isAutoSyncEnabled: boolean;
  onAutoAllocate?: (locationId: string) => void;
  selectedLocation: string;
}

const EquipmentUsageSummary: React.FC<EquipmentUsageSummaryProps> = ({
  equipmentUsage,
  isAutoSyncEnabled,
  onAutoAllocate,
  selectedLocation
}) => {
  if (!equipmentUsage) return null;

  return (
    <div>
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Activity className="h-4 w-4" />
        Equipment Required from Diagram
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
        {!isAutoSyncEnabled && onAutoAllocate && selectedLocation && (
          <Button
            onClick={() => onAutoAllocate(selectedLocation)}
            size="sm"
            className="w-full mt-2"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Manually Sync Equipment
          </Button>
        )}
      </div>
    </div>
  );
};

export default EquipmentUsageSummary;
