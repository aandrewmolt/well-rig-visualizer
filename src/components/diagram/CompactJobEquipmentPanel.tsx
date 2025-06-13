
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Settings, 
  TrendingUp,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useRobustEquipmentTracking } from '@/hooks/useRobustEquipmentTracking';
import { useInventoryMapperSync } from '@/hooks/useInventoryMapperSync';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import ConflictIndicator from './ConflictIndicator';

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
  const [autoAllocationEnabled, setAutoAllocationEnabled] = useState(false);
  
  // Get sync data
  const {
    conflicts,
    allocations,
    getEquipmentStatus,
    getJobEquipment,
    resolveConflict,
    syncInventoryStatus
  } = useInventoryMapperSync();
  
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
  const deployedEquipment = data.equipmentItems.filter(
    item => item.status === 'deployed' && item.jobId === jobId
  );
  const isConsistent = validateInventoryConsistency();
  
  // Get real-time job equipment
  const jobEquipmentIds = getJobEquipment(jobId);
  const jobConflicts = conflicts.filter(c => c.requestedJobId === jobId || c.currentJobId === jobId);

  // Enhanced availability check with detailed feedback
  const checkDetailedAvailability = () => {
    const availabilityReport = {
      available: true,
      issues: [] as string[],
      warnings: [] as string[],
      totalRequired: 0,
      totalAvailable: 0,
    };
    
    // Check cables
    Object.entries(usage.cables).forEach(([typeId, details]) => {
      // Check bulk equipment
      const availableBulk = data.equipmentItems
        .filter(item => item.typeId === typeId && item.locationId === selectedLocation && item.status === 'available')
        .reduce((sum, item) => sum + item.quantity, 0);
      
      // Check individual equipment
      const availableIndividual = data.individualEquipment
        .filter(item => item.typeId === typeId && item.locationId === selectedLocation && item.status === 'available')
        .length;
      
      const available = availableBulk + availableIndividual;
      
      availabilityReport.totalRequired += details.quantity;
      availabilityReport.totalAvailable += available;
      
      if (available < details.quantity) {
        availabilityReport.available = false;
        availabilityReport.issues.push(`${details.typeName}: need ${details.quantity}, have ${available}`);
      } else if (available === details.quantity) {
        availabilityReport.warnings.push(`${details.typeName}: exact match (${available})`);
      }
    });

    // Check other equipment
    const equipmentChecks = [
      { typeId: 'pressure-gauge-1502', quantity: usage.gauges, name: '1502 Pressure Gauge' },
      { typeId: 'y-adapter', quantity: usage.adapters, name: 'Y Adapter' },
      { typeId: 'customer-computer', quantity: usage.computers, name: 'Customer Computer' },
      { typeId: 'starlink', quantity: usage.satellite, name: 'Starlink' },
    ];

    equipmentChecks.forEach(({ typeId, quantity, name }) => {
      if (quantity > 0) {
        // Check bulk equipment
        const availableBulk = data.equipmentItems
          .filter(item => item.typeId === typeId && item.locationId === selectedLocation && item.status === 'available')
          .reduce((sum, item) => sum + item.quantity, 0);
        
        // Check individual equipment
        const availableIndividual = data.individualEquipment
          .filter(item => item.typeId === typeId && item.locationId === selectedLocation && item.status === 'available')
          .length;
        
        const available = availableBulk + availableIndividual;
        
        availabilityReport.totalRequired += quantity;
        availabilityReport.totalAvailable += available;
        
        if (available < quantity) {
          availabilityReport.available = false;
          availabilityReport.issues.push(`${name}: need ${quantity}, have ${available}`);
        }
      }
    });

    return availabilityReport;
  };

  const availability = selectedLocation ? checkDetailedAvailability() : { 
    available: false, 
    issues: ['No location selected'], 
    warnings: [],
    totalRequired: 0,
    totalAvailable: 0,
  };

  const handleQuickAllocation = async () => {
    if (!selectedLocation) {
      toast.error('Please select a storage location first');
      return;
    }

    if (!availability.available) {
      toast.error(`Cannot allocate: ${availability.issues.join(', ')}`);
      return;
    }

    try {
      await performComprehensiveAllocation(selectedLocation);
      toast.success('Equipment allocated successfully!');
    } catch (error) {
      toast.error('Failed to allocate equipment');
      console.error('Allocation error:', error);
    }
  };

  const handleValidateAndFix = () => {
    const isValid = validateInventoryConsistency();
    if (isValid) {
      toast.success('Equipment allocation is consistent');
    } else {
      toast.warning('Inconsistencies detected - check equipment panel for details');
    }
  };

  const getStatusColor = () => {
    if (!isConsistent) return 'text-yellow-600';
    if (deployedEquipment.length === 0) return 'text-gray-500';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (isProcessing) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (!isConsistent) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (deployedEquipment.length === 0) return <Package className="h-4 w-4 text-gray-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              {getStatusIcon()}
              Equipment Status
              <Badge variant="secondary" className="text-xs">
                {deployedEquipment.length} deployed
              </Badge>
            </span>
            <div className="flex items-center gap-2">
              {jobConflicts.length > 0 && (
                <ConflictIndicator 
                  conflicts={jobConflicts} 
                  onResolveConflict={resolveConflict}
                  className="text-xs"
                />
              )}
              {!isConsistent && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Sync Issue
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Status Overview */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-blue-900">Required Equipment</span>
              <Badge variant="outline" className="text-xs">
                {Object.values(usage.cables).reduce((sum, cable) => sum + cable.quantity, 0) + 
                 usage.gauges + usage.adapters + usage.computers + usage.satellite} items
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-1 text-sm text-blue-800">
              {Object.entries(usage.cables).map(([typeId, details]) => (
                <div key={typeId} className="flex justify-between">
                  <span className="truncate">{details.typeName.replace(/ft.*/, 'ft')}:</span>
                  <span className="font-bold">{details.quantity}</span>
                </div>
              ))}
              {usage.gauges > 0 && (
                <div className="flex justify-between">
                  <span>1502 Pressure Gauge:</span>
                  <span className="font-bold">{usage.gauges}</span>
                </div>
              )}
              {usage.adapters > 0 && (
                <div className="flex justify-between">
                  <span>Adapters:</span>
                  <span className="font-bold">{usage.adapters}</span>
                </div>
              )}
              {usage.computers > 0 && (
                <div className="flex justify-between">
                  <span>Customer Computer:</span>
                  <span className="font-bold">{usage.computers}</span>
                </div>
              )}
              {usage.satellite > 0 && (
                <div className="flex justify-between">
                  <span>Starlink:</span>
                  <span className="font-bold">{usage.satellite}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Allocation Source Location</label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {data.storageLocations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Availability Status */}
          {selectedLocation && (
            <div className={`p-3 rounded-lg ${availability.available ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                {availability.available ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <span className={`font-medium ${availability.available ? 'text-green-900' : 'text-red-900'}`}>
                  {availability.available ? 'Ready to Allocate' : 'Cannot Allocate'}
                </span>
              </div>
              {availability.issues.length > 0 && (
                <div className="text-sm text-red-800 space-y-1">
                  {availability.issues.slice(0, 3).map((issue, idx) => (
                    <div key={idx}>• {issue}</div>
                  ))}
                  {availability.issues.length > 3 && (
                    <div>... and {availability.issues.length - 3} more issues</div>
                  )}
                </div>
              )}
              {availability.warnings.length > 0 && (
                <div className="text-sm text-yellow-800 mt-1">
                  <div>⚠️ {availability.warnings.length} warnings</div>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Quick Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleQuickAllocation}
              className="w-full"
              disabled={!selectedLocation || isProcessing || !availability.available}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Allocating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Quick Allocate All
                </span>
              )}
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleValidateAndFix}
                disabled={isProcessing}
                size="sm"
              >
                <Settings className="h-4 w-4 mr-1" />
                Validate
              </Button>
              <Button
                variant="destructive"
                onClick={returnAllJobEquipment}
                disabled={isProcessing || deployedEquipment.length === 0}
                size="sm"
              >
                Return All
              </Button>
            </div>
          </div>

          {/* Currently Deployed Summary with Real-time Status */}
          {deployedEquipment.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Deployed Equipment
                  </h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => syncInventoryStatus()}
                    className="h-6 px-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync
                  </Button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {deployedEquipment.slice(0, 5).map(item => {
                    const equipmentType = data.equipmentTypes.find(type => type.id === item.typeId);
                    const status = getEquipmentStatus(item.id);
                    return (
                      <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-green-50 rounded">
                        <span className="truncate">{equipmentType?.name || 'Unknown'}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{item.quantity}</Badge>
                          {status === 'deployed' && (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          )}
                          {status === 'allocated' && (
                            <AlertCircle className="h-3 w-3 text-yellow-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {deployedEquipment.length > 5 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      ... and {deployedEquipment.length - 5} more items
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompactJobEquipmentPanel;
