
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Package } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import ExtrasOnLocationPanel from './ExtrasOnLocationPanel';
import AutoSyncControls from './equipment/AutoSyncControls';
import EquipmentLocationSelector from './equipment/EquipmentLocationSelector';
import EquipmentAvailabilityStatus from './equipment/EquipmentAvailabilityStatus';
import EquipmentUsageSummary from './equipment/EquipmentUsageSummary';
import DeployedEquipmentList from './equipment/DeployedEquipmentList';

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
  isAutoSyncEnabled?: boolean;
  onToggleAutoSync?: (enabled: boolean) => void;
}

const JobEquipmentPanel: React.FC<JobEquipmentPanelProps> = ({ 
  jobId, 
  jobName, 
  equipmentUsage,
  extrasOnLocation = [],
  onAutoAllocate,
  onAddExtra,
  onRemoveExtra,
  isAutoSyncEnabled = true,
  onToggleAutoSync
}) => {
  const { data } = useInventoryData();
  const [selectedLocation, setSelectedLocation] = useState<string>(data.storageLocations[0]?.id || '');

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

    Object.entries(equipmentUsage.cables).forEach(([cableType, needed]) => {
      const typeId = typeMapping[cableType];
      if (typeId) {
        const available = getAvailableQuantity(typeId, selectedLocation);
        if (available < needed) {
          issues.push(`${cableType} cables: need ${needed}, have ${available}`);
        }
      }
    });

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

  useEffect(() => {
    if (isAutoSyncEnabled && selectedLocation && onAutoAllocate) {
      onAutoAllocate(selectedLocation);
    }
  }, [selectedLocation, isAutoSyncEnabled, onAutoAllocate]);

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
          <AutoSyncControls
            isAutoSyncEnabled={isAutoSyncEnabled}
            onToggleAutoSync={onToggleAutoSync}
          />

          <EquipmentLocationSelector
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
          />

          <EquipmentAvailabilityStatus
            availability={availability}
            equipmentUsage={equipmentUsage}
          />

          <EquipmentUsageSummary
            equipmentUsage={equipmentUsage}
            isAutoSyncEnabled={isAutoSyncEnabled}
            onAutoAllocate={onAutoAllocate}
            selectedLocation={selectedLocation}
          />

          <Separator />

          <DeployedEquipmentList jobId={jobId} />
        </CardContent>
      </Card>

      <ExtrasOnLocationPanel
        extrasOnLocation={extrasOnLocation}
        onAddExtra={onAddExtra || (() => {})}
        onRemoveExtra={onRemoveExtra || (() => {})}
      />
    </div>
  );
};

export default JobEquipmentPanel;
