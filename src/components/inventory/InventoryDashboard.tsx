
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, MapPin, AlertTriangle, CheckCircle, RotateCcw, Activity, Clock, TrendingUp, Briefcase } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useRealTimeInventory } from '@/hooks/useRealTimeInventory';
import { useAuditTrail } from '@/hooks/useAuditTrail';
import { useJobStorage } from '@/hooks/useJobStorage';
import JobDeploymentsSummary from './JobDeploymentsSummary';

const InventoryDashboard = () => {
  const { data, resetToDefaultInventory } = useInventoryData();
  const { jobs } = useJobStorage();
  const { alerts, getInventorySnapshot, autoCorrectInventory } = useRealTimeInventory();
  const { getRecentActivity, generateActivitySummary, formatAuditEntry } = useAuditTrail();

  const snapshot = getInventorySnapshot();
  const recentActivity = getRecentActivity(5);
  const activitySummary = generateActivitySummary('week');

  const totalEquipment = data.equipmentItems.reduce((sum, item) => sum + item.quantity, 0);
  const availableEquipment = data.equipmentItems
    .filter(item => item.status === 'available')
    .reduce((sum, item) => sum + item.quantity, 0);
  const deployedEquipment = data.equipmentItems
    .filter(item => item.status === 'deployed')
    .reduce((sum, item) => sum + item.quantity, 0);
  const redTaggedEquipment = data.equipmentItems
    .filter(item => item.status === 'red-tagged')
    .reduce((sum, item) => sum + item.quantity, 0);

  // Calculate active jobs with deployed equipment
  const activeJobsWithEquipment = new Set(
    data.equipmentItems
      .filter(item => item.status === 'deployed' && item.jobId)
      .map(item => item.jobId)
  ).size;

  const getEquipmentTypeName = (typeId: string) => {
    return data.equipmentTypes.find(type => type.id === typeId)?.name || 'Unknown';
  };

  const getLocationName = (locationId: string) => {
    return data.storageLocations.find(loc => loc.id === locationId)?.name || 'Unknown';
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'error');
  const warningAlerts = alerts.filter(alert => alert.severity === 'warning');

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Inventory Dashboard</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Last updated: {snapshot.lastValidation.toLocaleTimeString()}
            </Badge>
            {snapshot.criticalAlerts > 0 && (
              <Badge variant="destructive" className="text-xs">
                {snapshot.criticalAlerts} Critical Issues
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={autoCorrectInventory}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Auto-Correct
          </Button>
          <Button 
            onClick={resetToDefaultInventory}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
        </div>
      </div>

      {/* System Alerts */}
      {(criticalAlerts.length > 0 || warningAlerts.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-red-100 rounded text-sm">
                  <span className="text-red-800">{alert.message}</span>
                  <Badge variant="destructive" className="text-xs">Critical</Badge>
                </div>
              ))}
              {warningAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-yellow-100 rounded text-sm">
                  <span className="text-yellow-800">{alert.message}</span>
                  <Badge variant="outline" className="text-xs border-yellow-400">Warning</Badge>
                </div>
              ))}
              {alerts.length > 6 && (
                <div className="text-center text-sm text-gray-600 pt-2">
                  ...and {alerts.length - 6} more alerts
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                <p className="text-2xl font-bold">{totalEquipment}</p>
                <p className="text-xs text-gray-500">{data.equipmentItems.length} items tracked</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{availableEquipment}</p>
                <p className="text-xs text-gray-500">{Math.round((availableEquipment/totalEquipment)*100)}% of total</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deployed</p>
                <p className="text-2xl font-bold text-orange-600">{deployedEquipment}</p>
                <p className="text-xs text-gray-500">{activeJobsWithEquipment} active jobs</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Red Tagged</p>
                <p className="text-2xl font-bold text-red-600">{redTaggedEquipment}</p>
                <p className="text-xs text-gray-500">{alerts.filter(a => a.type === 'validation-error').length} validation errors</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Deployments Summary - NEW SECTION */}
      <JobDeploymentsSummary />

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activitySummary.totalActivities}</div>
              <div className="text-sm text-gray-600">Total Actions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activitySummary.deployments}</div>
              <div className="text-sm text-gray-600">Deployments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{activitySummary.returns}</div>
              <div className="text-sm text-gray-600">Returns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{activitySummary.autoActions}</div>
              <div className="text-sm text-gray-600">Auto Actions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment by Location */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.storageLocations.map(location => {
              const locationItems = data.equipmentItems.filter(item => item.locationId === location.id);
              const locationTotal = locationItems.reduce((sum, item) => sum + item.quantity, 0);
              const locationAvailable = locationItems
                .filter(item => item.status === 'available')
                .reduce((sum, item) => sum + item.quantity, 0);
              const locationDeployed = locationItems
                .filter(item => item.status === 'deployed')
                .reduce((sum, item) => sum + item.quantity, 0);
              
              return (
                <div key={location.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{location.name}</h3>
                    <div className="flex items-center gap-2">
                      {location.isDefault && <Badge variant="secondary">Default</Badge>}
                      <Badge variant="outline" className="text-xs">
                        {Math.round((locationAvailable/locationTotal)*100) || 0}% Available
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>Total: <span className="font-medium">{locationTotal}</span></div>
                    <div>Available: <span className="font-medium text-green-600">{locationAvailable}</span></div>
                    <div>Deployed: <span className="font-medium text-orange-600">{locationDeployed}</span></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {locationItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{getEquipmentTypeName(item.typeId)}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.quantity}</span>
                          <Badge 
                            variant={
                              item.status === 'available' ? 'default' :
                              item.status === 'deployed' ? 'secondary' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity with Enhanced Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentActivity.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No recent activity</div>
            ) : (
              recentActivity.map(entry => {
                const formatted = formatAuditEntry(entry);
                return (
                  <div key={entry.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                    <div>
                      <p className="text-sm font-medium">{formatted.formattedAction}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{entry.timestamp.toLocaleString()}</span>
                        <Badge variant="outline" className="text-xs">
                          {entry.metadata.source}
                        </Badge>
                        {entry.details.jobId && (
                          <Badge variant="outline" className="text-xs">
                            Job: {entry.details.jobId}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={
                        entry.action === 'deploy' ? 'default' :
                        entry.action === 'return' ? 'secondary' :
                        entry.action === 'create' ? 'default' : 'outline'
                      }
                      className="text-xs"
                    >
                      {entry.action}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDashboard;
