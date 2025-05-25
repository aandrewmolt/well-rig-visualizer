
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Package, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Activity, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
    <Card className="bg-gradient-to-br from-white to-slate-50/50 shadow-lg border-slate-200/50">
      <CardHeader className="pb-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <div className="p-1.5 bg-white/20 rounded-md">
            <Package className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              Equipment - {jobName}
              {isConsistent ? (
                <CheckCircle className="h-3 w-3 text-green-400" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-yellow-400" />
              )}
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <EquipmentLocationSelector
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />

        {/* Enhanced Summary Grid */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Quick Overview</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between p-2 bg-white rounded border border-blue-100">
              <span className="text-gray-600">Connections</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {report.summary.totalConnections}
              </Badge>
            </div>
            <div className="flex justify-between p-2 bg-white rounded border border-blue-100">
              <span className="text-gray-600">Cables</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {report.summary.totalCables}
              </Badge>
            </div>
            <div className="flex justify-between p-2 bg-white rounded border border-blue-100">
              <span className="text-gray-600">Types</span>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {report.summary.cableTypes}
              </Badge>
            </div>
            <div className="flex justify-between p-2 bg-white rounded border border-blue-100">
              <span className="text-gray-600">Deployed</span>
              <Badge variant="outline" className={`${deployedEquipment.length > 0 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                {deployedEquipment.length}
              </Badge>
            </div>
          </div>
        </div>

        {/* Enhanced Collapsible Details */}
        <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between text-xs h-8 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
              <span className="flex items-center gap-2">
                <Package className="h-3 w-3" />
                Equipment Details
              </span>
              {isDetailsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            {/* Cable Requirements - Enhanced */}
            {Object.keys(usage.cables).length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <h4 className="text-xs font-semibold text-gray-700">Cable Requirements</h4>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {Object.entries(usage.cables).map(([typeId, details]) => (
                    <div key={typeId} className="flex justify-between items-center text-xs p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded border border-blue-200">
                      <span className="truncate flex-1 font-medium text-blue-800">{details.typeName}</span>
                      <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-300">
                        {details.quantity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Equipment - Horizontal Layout */}
            {(usage.gauges > 0 || usage.adapters > 0 || usage.computers > 0 || usage.satellite > 0) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h4 className="text-xs font-semibold text-gray-700">Equipment Needed</h4>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {usage.gauges > 0 && (
                    <div className="flex justify-between items-center p-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded border border-orange-200">
                      <span className="font-medium text-orange-800">Gauges</span>
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                        {usage.gauges}
                      </Badge>
                    </div>
                  )}
                  {usage.adapters > 0 && (
                    <div className="flex justify-between items-center p-2 bg-gradient-to-r from-purple-50 to-violet-50 rounded border border-purple-200">
                      <span className="font-medium text-purple-800">Y Adapters</span>
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                        {usage.adapters}
                      </Badge>
                    </div>
                  )}
                  {usage.computers > 0 && (
                    <div className="flex justify-between items-center p-2 bg-gradient-to-r from-teal-50 to-cyan-50 rounded border border-teal-200">
                      <span className="font-medium text-teal-800">Computers</span>
                      <Badge variant="outline" className="bg-teal-100 text-teal-800 border-teal-300">
                        {usage.computers}
                      </Badge>
                    </div>
                  )}
                  {usage.satellite > 0 && (
                    <div className="flex justify-between items-center p-2 bg-gradient-to-r from-pink-50 to-rose-50 rounded border border-pink-200">
                      <span className="font-medium text-pink-800">Satellite</span>
                      <Badge variant="outline" className="bg-pink-100 text-pink-800 border-pink-300">
                        {usage.satellite}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Deployed Equipment - Enhanced */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${deployedEquipment.length > 0 ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                <h4 className="text-xs font-semibold text-gray-700">
                  Currently Deployed ({deployedEquipment.length})
                </h4>
              </div>
              {deployedEquipment.length > 0 ? (
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {deployedEquipment.map(item => {
                    const equipmentType = data.equipmentTypes.find(type => type.id === item.typeId);
                    return (
                      <div key={item.id} className="flex justify-between items-center text-xs p-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded border border-emerald-200">
                        <span className="truncate flex-1 font-medium text-emerald-800">{equipmentType?.name || 'Unknown'}</span>
                        <Badge variant="outline" className="ml-2 bg-emerald-100 text-emerald-800 border-emerald-300">
                          {item.quantity}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded border border-gray-200 text-center">
                  No equipment deployed yet
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Enhanced Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <button
            onClick={() => performComprehensiveAllocation(selectedLocation)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-2 rounded-md text-xs font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedLocation}
          >
            Allocate Equipment
          </button>
          <button
            onClick={returnAllJobEquipment}
            className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white px-2 py-2 rounded-md text-xs font-medium hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-md"
          >
            Return All
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactJobEquipmentPanel;
