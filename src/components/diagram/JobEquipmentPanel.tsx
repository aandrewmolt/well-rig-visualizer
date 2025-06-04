
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
    isProcessing
  } = useRobustEquipmentTracking(jobId, nodes, edges);

  const usage = analyzeEquipmentUsage();
  const report = generateEquipmentReport(usage);

  // Calculate equipment counts from diagram
  const calculateDiagramEquipment = () => {
    const counts = {
      SL: 0, // Starlink/Satellite
      CC: 0, // Customer Computer  
      SS: 0, // ShearStream Box
      gauges: 0,
      adapters: 0,
      cables: {} as { [key: string]: number }
    };

    // Count from nodes
    nodes.forEach(node => {
      switch (node.type) {
        case 'satellite':
          counts.SL += 1;
          break;
        case 'customerComputer':
          counts.CC += 1;
          break;
        case 'companyComputer':
          counts.SS += 1;
          break;
        case 'well':
        case 'wellsideGauge':
          counts.gauges += 1;
          break;
        case 'yAdapter':
          counts.adapters += 1;
          break;
      }
    });

    // Count cables from edges
    edges.forEach(edge => {
      if (edge.type === 'cable' && edge.data?.cableTypeId) {
        const cableType = data.equipmentTypes.find(type => type.id === edge.data.cableTypeId);
        if (cableType) {
          const cableName = cableType.name;
          counts.cables[cableName] = (counts.cables[cableName] || 0) + 1;
        }
      }
    });

    return counts;
  };

  const diagramCounts = calculateDiagramEquipment();

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
            Equipment Overview - {jobName}
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

          {/* Diagram Equipment Summary */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2">Equipment Required from Diagram</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {diagramCounts.SL > 0 && (
                <div className="flex justify-between">
                  <span>SL (Starlink):</span>
                  <span className="font-bold">{diagramCounts.SL}</span>
                </div>
              )}
              {diagramCounts.CC > 0 && (
                <div className="flex justify-between">
                  <span>CC (Customer Computer):</span>
                  <span className="font-bold">{diagramCounts.CC}</span>
                </div>
              )}
              {diagramCounts.SS > 0 && (
                <div className="flex justify-between">
                  <span>SS (ShearStream Box):</span>
                  <span className="font-bold">{diagramCounts.SS}</span>
                </div>
              )}
              {diagramCounts.gauges > 0 && (
                <div className="flex justify-between">
                  <span>Gauges:</span>
                  <span className="font-bold">{diagramCounts.gauges}</span>
                </div>
              )}
              {diagramCounts.adapters > 0 && (
                <div className="flex justify-between">
                  <span>Y Adapters:</span>
                  <span className="font-bold">{diagramCounts.adapters}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cable Requirements */}
          {Object.keys(diagramCounts.cables).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Cable Requirements</h4>
              {Object.entries(diagramCounts.cables).map(([cableName, quantity]) => (
                <div key={cableName} className="p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{cableName}</span>
                    <span className="font-bold text-lg">{quantity}</span>
                  </div>
                </div>
              ))}
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
              className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
              disabled={!selectedLocation || isProcessing}
            >
              {isProcessing ? 'Allocating...' : 'Allocate Equipment'}
            </button>
            <button
              onClick={returnAllJobEquipment}
              className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 disabled:opacity-50"
              disabled={isProcessing}
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
