
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Package, RefreshCw, CheckCircle, AlertTriangle, Wrench, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Node } from '@xyflow/react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useRobustEquipmentTracking } from '@/hooks/useRobustEquipmentTracking';
import { useMaintenanceTracking } from '@/hooks/inventory/useMaintenanceTracking';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvancedView, setShowAdvancedView] = useState(false);
  
  const {
    performComprehensiveAllocation,
    returnAllJobEquipment,
    analyzeEquipmentUsage,
    validateInventoryConsistency,
  } = useRobustEquipmentTracking(jobId, nodes, edges);

  const {
    maintenanceAlerts,
    criticalCount,
  } = useMaintenanceTracking(data.individualEquipment);

  const equipmentUsage = analyzeEquipmentUsage();
  const deployedItems = data.equipmentItems.filter(
    item => item.status === 'deployed' && item.jobId === jobId
  );

  const handleAllocateEquipment = () => {
    if (!selectedLocation) return;
    performComprehensiveAllocation(selectedLocation);
  };

  // Filter alerts relevant to this job
  const jobRelevantAlerts = maintenanceAlerts.filter(alert => {
    const equipment = data.individualEquipment.find(eq => eq.id === alert.equipmentId);
    return equipment && (equipment.status === 'available' || equipment.jobId === jobId);
  }).slice(0, 2);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Equipment Status
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs h-5">{criticalCount}</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {showAdvancedView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedView(!showAdvancedView)}
                className="h-6 w-6 p-0"
              >
                <Search className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
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

        {/* Equipment Requirements Summary */}
        <div>
          <h4 className="text-xs font-medium mb-2">Required from Diagram</h4>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="bg-blue-50 p-2 rounded flex justify-between">
              <span>Cables:</span>
              <span className="font-bold">{Object.values(equipmentUsage.cables).reduce((sum, cable) => sum + cable.quantity, 0)}</span>
            </div>
            <div className="bg-green-50 p-2 rounded flex justify-between">
              <span>Equipment:</span>
              <span className="font-bold">{equipmentUsage.gauges + equipmentUsage.adapters + equipmentUsage.computers + equipmentUsage.satellite}</span>
            </div>
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Detailed Requirements */}
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

            {/* Advanced Features */}
            {showAdvancedView && (
              <>
                {/* Cable Details with Enhanced Info */}
                {Object.keys(equipmentUsage.cables).length > 0 && (
                  <div className="space-y-1">
                    <h5 className="text-xs font-medium">Cable Details</h5>
                    {Object.entries(equipmentUsage.cables).map(([typeId, details]) => (
                      <div key={typeId} className="p-2 bg-gray-50 rounded text-xs">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="font-medium">{details.typeName}</span>
                            <div className="text-gray-500 mt-1">
                              {details.length} {details.category}
                              {details.version && (
                                <span className="ml-1 px-1 bg-blue-100 text-blue-700 rounded text-xs">
                                  {details.version}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-bold">{details.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Maintenance Alerts */}
                {jobRelevantAlerts.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                      <Wrench className="h-3 w-3 text-yellow-600" />
                      Equipment Alerts
                    </h4>
                    <div className="space-y-1">
                      {jobRelevantAlerts.map((alert, index) => (
                        <div key={index} className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs">
                          <div className="font-medium">{alert.equipmentName}</div>
                          <div className="text-gray-600">{alert.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Deployed Equipment Status */}
        {deployedItems.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Currently Deployed ({deployedItems.length})
            </h4>
            {isExpanded ? (
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
            ) : (
              <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
                ✓ Equipment allocated and deployed
              </div>
            )}
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
          
          <div className="flex gap-1">
            <Button
              onClick={validateInventoryConsistency}
              variant="ghost"
              size="sm"
              className="flex-1 h-7 text-xs"
            >
              <AlertTriangle className="mr-1 h-3 w-3" />
              Validate
            </Button>
            
            <Button
              onClick={() => setShowAdvancedView(!showAdvancedView)}
              variant="ghost"
              size="sm"
              className="flex-1 h-7 text-xs"
            >
              <Search className="mr-1 h-3 w-3" />
              {showAdvancedView ? 'Simple' : 'Advanced'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactJobEquipmentPanel;
