
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Zap } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';
import { useEquipmentUsageAnalyzer } from '@/hooks/equipment/useEquipmentUsageAnalyzer';
import { ExtrasOnLocationItem } from '@/hooks/useExtrasOnLocation';
import { useInventoryData } from '@/hooks/useInventoryData';

interface EquipmentSummaryPanelProps {
  nodes: Node[];
  edges: Edge[];
  selectedShearstreamBoxes: string[];
  selectedStarlink: string;
  selectedCustomerComputers: string[];
  extrasOnLocation: ExtrasOnLocationItem[];
}

const EquipmentSummaryPanel: React.FC<EquipmentSummaryPanelProps> = ({
  nodes,
  edges,
  selectedShearstreamBoxes,
  selectedStarlink,
  selectedCustomerComputers,
  extrasOnLocation,
}) => {
  const { analyzeEquipmentUsage } = useEquipmentUsageAnalyzer(nodes, edges);
  const { data } = useInventoryData();
  
  const equipmentUsage = analyzeEquipmentUsage();

  // Count main equipment from nodes and selections
  const shearstreamBoxCount = nodes.filter(node => node.type === 'mainBox').length;
  const customerComputerCount = nodes.filter(node => node.type === 'customerComputer').length;
  const satelliteCount = nodes.filter(node => node.type === 'satellite').length;
  const yAdapterCount = nodes.filter(node => node.type === 'yAdapter').length;
  const wellsideGaugeCount = nodes.filter(node => node.type === 'wellsideGauge').length;
  const wellCount = nodes.filter(node => node.type === 'well').length;

  // Get extras grouped by type
  const extrasGrouped = extrasOnLocation.reduce((acc, extra) => {
    const equipmentType = data.equipmentTypes.find(type => type.id === extra.equipmentTypeId);
    const typeName = equipmentType?.name || 'Unknown';
    
    if (!acc[typeName]) {
      acc[typeName] = [];
    }
    acc[typeName].push(extra);
    return acc;
  }, {} as Record<string, ExtrasOnLocationItem[]>);

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5" />
          Equipment Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Equipment */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Main Equipment</h4>
          <div className="space-y-1 text-sm">
            {shearstreamBoxCount > 0 && (
              <div className="flex justify-between">
                <span>ShearStream Box</span>
                <Badge variant="secondary">{shearstreamBoxCount}</Badge>
              </div>
            )}
            {satelliteCount > 0 && (
              <div className="flex justify-between">
                <span>Starlink</span>
                <Badge variant="secondary">{satelliteCount}</Badge>
              </div>
            )}
            {customerComputerCount > 0 && (
              <div className="flex justify-between">
                <span>Customer Computer</span>
                <Badge variant="secondary">{customerComputerCount}</Badge>
              </div>
            )}
            {yAdapterCount > 0 && (
              <div className="flex justify-between">
                <span>Y Adapter</span>
                <Badge variant="secondary">{yAdapterCount}</Badge>
              </div>
            )}
            {wellsideGaugeCount > 0 && (
              <div className="flex justify-between">
                <span>Wellside Gauge</span>
                <Badge variant="secondary">{wellsideGaugeCount}</Badge>
              </div>
            )}
            {wellCount > 0 && (
              <div className="flex justify-between">
                <span>Wells</span>
                <Badge variant="secondary">{wellCount}</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Cables */}
        {Object.keys(equipmentUsage.cables).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Cables</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(equipmentUsage.cables).map(([typeId, cable]) => (
                <div key={typeId} className="flex justify-between">
                  <span>{cable.typeName}</span>
                  <Badge variant="secondary">{cable.quantity}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Direct Connections */}
        {equipmentUsage.directConnections > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Connections</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Direct Connections
                </span>
                <Badge variant="outline">{equipmentUsage.directConnections}</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Extras on Location */}
        {Object.keys(extrasGrouped).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Extras on Location</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(extrasGrouped).map(([typeName, extras]) => {
                const hasIndividualItems = extras.some(extra => extra.individualEquipmentId);
                
                if (hasIndividualItems) {
                  // Show individual items for tracked equipment
                  return extras.map(extra => {
                    const individualEquipment = data.individualEquipment.find(eq => eq.id === extra.individualEquipmentId);
                    const itemName = individualEquipment?.equipmentId || 'Unknown';
                    return (
                      <div key={extra.id} className="flex justify-between">
                        <span>{typeName} ({itemName})</span>
                        <Badge variant="outline" className="bg-yellow-100">Extra</Badge>
                      </div>
                    );
                  });
                } else {
                  // Show quantity for non-tracked equipment
                  const totalQuantity = extras.reduce((sum, extra) => sum + extra.quantity, 0);
                  return (
                    <div key={typeName} className="flex justify-between">
                      <span>{typeName}</span>
                      <div className="flex gap-1">
                        <Badge variant="secondary">{totalQuantity}</Badge>
                        <Badge variant="outline" className="bg-yellow-100">Extra</Badge>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}

        {/* Total Summary */}
        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm font-medium">
            <span>Total Connections:</span>
            <Badge variant="default">{equipmentUsage.totalConnections}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentSummaryPanel;
