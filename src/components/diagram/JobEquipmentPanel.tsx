
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useRobustEquipmentTracking } from '@/hooks/useRobustEquipmentTracking';
import ExtrasOnLocationPanel from './ExtrasOnLocationPanel';
import EquipmentLocationSelector from './equipment/EquipmentLocationSelector';
import { Node, Edge } from '@xyflow/react';

interface JobEquipmentPanelProps {
  jobId: string;
  jobName: string;
  nodes: Node[];
  edges: Edge[];
  extrasOnLocation?: Array<{
    id: string;
    equipmentTypeId: string;
    quantity: number;
    reason: string;
    addedDate: Date;
    notes?: string;
  }>;
  onAddExtra?: (equipmentTypeId: string, quantity: number, reason: string, notes?: string) => void;
  onRemoveExtra?: (extraId: string) => void;
}

const JobEquipmentPanel: React.FC<JobEquipmentPanelProps> = ({ 
  jobId, 
  jobName, 
  nodes,
  edges,
  extrasOnLocation = [],
  onAddExtra,
  onRemoveExtra,
}) => {
  const { data } = useInventoryData();
  const [selectedLocation, setSelectedLocation] = useState<string>(data.storageLocations[0]?.id || '');
  
  const {
    performComprehensiveAllocation,
    returnAllJobEquipment,
    validateInventoryConsistency,
    analyzeEquipmentUsage,
    generateEquipmentReport,
  } = useRobustEquipmentTracking(jobId, nodes, edges);

  const usage = analyzeEquipmentUsage();
  const report = generateEquipmentReport(usage);

  const getDeployedEquipment = () => {
    return data.equipmentItems.filter(
      item => item.status === 'deployed' && item.jobId === jobId
    );
  };

  const deployedEquipment = getDeployedEquipment();
  const isConsistent = validateInventoryConsistency();

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Equipment Tracking - {jobName}
            {isConsistent ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EquipmentLocationSelector
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
          />

          {/* Equipment Summary */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2">Connection Analysis Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Total Connections: {report.summary.totalConnections}</div>
              <div>Direct Connections: {report.summary.directConnections}</div>
              <div>Cable Types Used: {report.summary.cableTypes}</div>
              <div>Total Cables: {report.summary.totalCables}</div>
            </div>
          </div>

          {/* Enhanced Cable Details */}
          {Object.keys(usage.cables).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Cable Requirements</h4>
              {Object.entries(usage.cables).map(([typeId, details]) => (
                <div key={typeId} className="p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="font-medium">{details.typeName}</span>
                      <div className="text-xs text-gray-500 mt-1">
                        {details.length} {details.category}
                        {details.version && (
                          <span className="ml-2 px-1 bg-blue-100 text-blue-700 rounded">
                            {details.version}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-lg">{details.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Equipment Requirements */}
          {(usage.gauges > 0 || usage.adapters > 0 || usage.computers > 0 || usage.satellite > 0) && (
            <div className="space-y-2">
              <h4 className="font-medium">Equipment Requirements</h4>
              {usage.gauges > 0 && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Pressure Gauges</span>
                  <span className="font-bold">{usage.gauges}</span>
                </div>
              )}
              {usage.adapters > 0 && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Y Adapters</span>
                  <span className="font-bold">{usage.adapters}</span>
                </div>
              )}
              {usage.computers > 0 && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Company Computers</span>
                  <span className="font-bold">{usage.computers}</span>
                </div>
              )}
              {usage.satellite > 0 && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Satellite Equipment</span>
                  <span className="font-bold">{usage.satellite}</span>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Deployed Equipment */}
          <div>
            <h4 className="font-medium mb-2">Currently Deployed ({deployedEquipment.length} items)</h4>
            {deployedEquipment.length > 0 ? (
              <div className="space-y-1">
                {deployedEquipment.map(item => {
                  const equipmentType = data.equipmentTypes.find(type => type.id === item.typeId);
                  return (
                    <div key={item.id} className="flex justify-between text-sm p-2 bg-green-50 rounded">
                      <span>{equipmentType?.name || 'Unknown'}</span>
                      <span className="font-medium">{item.quantity}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No equipment currently deployed</p>
            )}
          </div>

          {/* Manual Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => performComprehensiveAllocation(selectedLocation)}
              className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
              disabled={!selectedLocation}
            >
              Allocate Equipment
            </button>
            <button
              onClick={returnAllJobEquipment}
              className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
            >
              Return All Equipment
            </button>
          </div>
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
