import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Package, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useRobustEquipmentTracking } from '@/hooks/useRobustEquipmentTracking';
import EquipmentLocationSelector from './equipment/EquipmentLocationSelector';
import { Node, Edge } from '@xyflow/react';

interface CompactJobEquipmentPanelProps {
  jobId: string;
  jobName: string;
  nodes: Node[];
  edges: Edge[];
}

const CompactJobEquipmentPanel: React.FC<CompactJobEquipmentPanelProps> = ({ 
  jobId, 
  jobName, 
  nodes,
  edges,
}) => {
  const { data } = useInventoryData();
  const [selectedLocation, setSelectedLocation] = useState<string>(data.storageLocations[0]?.id || '');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const {
    performComprehensiveAllocation,
    returnAllJobEquipment,
    validateInventoryConsistency,
    analyzeEquipmentUsage,
    generateEquipmentReport,
  } = useRobustEquipmentTracking(jobId, nodes, edges);

  const usage = analyzeEquipmentUsage();
  const report = generateEquipmentReport(usage);
  const isConsistent = validateInventoryConsistency();

  const getDeployedEquipment = () => {
    return data.equipmentItems.filter(
      item => item.status === 'deployed' && item.jobId === jobId
    );
  };

  const deployedEquipment = getDeployedEquipment();

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4" />
          Equipment - {jobName}
          {isConsistent ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <AlertTriangle className="h-3 w-3 text-yellow-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <EquipmentLocationSelector
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />

        {/* Compact Summary Grid */}
        <div className="bg-blue-50 p-2 rounded text-xs">
          <div className="grid grid-cols-2 gap-1">
            <div>Connections: {report.summary.totalConnections}</div>
            <div>Cables: {report.summary.totalCables}</div>
            <div>Cable Types: {report.summary.cableTypes}</div>
            <div>Deployed: {deployedEquipment.length}</div>
          </div>
        </div>

        {/* Collapsible Details */}
        <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between text-xs h-7">
              Equipment Details
              {isDetailsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {/* Cable Requirements - Compact Grid */}
            {Object.keys(usage.cables).length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium">Cables</h4>
                <div className="grid grid-cols-1 gap-1">
                  {Object.entries(usage.cables).map(([typeId, details]) => (
                    <div key={typeId} className="flex justify-between text-xs p-1 bg-gray-50 rounded">
                      <span className="truncate flex-1">{details.typeName}</span>
                      <span className="font-bold ml-2">{details.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Equipment - Horizontal Layout */}
            {(usage.gauges > 0 || usage.adapters > 0 || usage.computers > 0 || usage.satellite > 0) && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium">Equipment</h4>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {usage.gauges > 0 && (
                    <div className="flex justify-between p-1 bg-gray-50 rounded">
                      <span>Gauges</span>
                      <span className="font-bold">{usage.gauges}</span>
                    </div>
                  )}
                  {usage.adapters > 0 && (
                    <div className="flex justify-between p-1 bg-gray-50 rounded">
                      <span>Y Adapters</span>
                      <span className="font-bold">{usage.adapters}</span>
                    </div>
                  )}
                  {usage.computers > 0 && (
                    <div className="flex justify-between p-1 bg-gray-50 rounded">
                      <span>Computers</span>
                      <span className="font-bold">{usage.computers}</span>
                    </div>
                  )}
                  {usage.satellite > 0 && (
                    <div className="flex justify-between p-1 bg-gray-50 rounded">
                      <span>Satellite</span>
                      <span className="font-bold">{usage.satellite}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Deployed Equipment */}
            <div>
              <h4 className="text-xs font-medium mb-1">Deployed ({deployedEquipment.length})</h4>
              {deployedEquipment.length > 0 ? (
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {deployedEquipment.map(item => {
                    const equipmentType = data.equipmentTypes.find(type => type.id === item.typeId);
                    return (
                      <div key={item.id} className="flex justify-between text-xs p-1 bg-green-50 rounded">
                        <span className="truncate flex-1">{equipmentType?.name || 'Unknown'}</span>
                        <span className="font-medium ml-2">{item.quantity}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-xs">None deployed</p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons - Manual Only */}
        <div className="flex gap-1">
          <button
            onClick={() => performComprehensiveAllocation(selectedLocation)}
            className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
            disabled={!selectedLocation}
          >
            Allocate Equipment
          </button>
          <button
            onClick={returnAllJobEquipment}
            className="flex-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
          >
            Return All
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactJobEquipmentPanel;
