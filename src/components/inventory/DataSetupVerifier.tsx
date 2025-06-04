
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useSupabaseRealTimeInventory } from '@/hooks/supabase/useSupabaseRealTimeInventory';
import { toast } from 'sonner';

const DataSetupVerifier: React.FC = () => {
  const { data, isLoading } = useSupabaseInventory();
  const { isConnected, lastSync, forceSync } = useSupabaseRealTimeInventory();
  const [verificationResults, setVerificationResults] = useState<{
    equipmentTypes: boolean;
    storageLocations: boolean;
    realTimeConnection: boolean;
    dataConsistency: boolean;
  }>({
    equipmentTypes: false,
    storageLocations: false,
    realTimeConnection: false,
    dataConsistency: false
  });

  useEffect(() => {
    const runVerification = () => {
      // Check equipment types
      const hasRequiredTypes = [
        'Customer Computer',
        'Starlink', 
        'ShearStream Box',
        '100ft Cable',
        '200ft Cable',
        '300ft Cable',
        '1502 Pressure Gauge',
        'Y Adapter Cable'
      ].every(requiredType => 
        data.equipmentTypes.some(type => type.name === requiredType)
      );

      // Check storage locations
      const hasStorageLocations = data.storageLocations.length > 0;

      // Check data consistency
      const allEquipmentTypesValid = data.equipmentItems.every(item => 
        data.equipmentTypes.some(type => type.id === item.typeId)
      );
      const allLocationsValid = data.equipmentItems.every(item =>
        data.storageLocations.some(location => location.id === item.locationId)
      );
      const dataConsistency = allEquipmentTypesValid && allLocationsValid;

      setVerificationResults({
        equipmentTypes: hasRequiredTypes,
        storageLocations: hasStorageLocations,
        realTimeConnection: isConnected,
        dataConsistency
      });
    };

    if (!isLoading) {
      runVerification();
    }
  }, [data, isLoading, isConnected]);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge className={status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {status ? 'OK' : 'Issues'}
      </Badge>
    );
  };

  const allSystemsGo = Object.values(verificationResults).every(Boolean);

  const handleForceSync = async () => {
    try {
      await forceSync();
      toast.success('Data synchronized successfully');
    } catch (error) {
      toast.error('Failed to sync data');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Clock className="h-6 w-6 animate-spin mr-2" />
          <span>Verifying system setup...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>System Status</span>
          {allSystemsGo ? (
            <Badge className="bg-green-100 text-green-800">All Systems Operational</Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-800">Setup Required</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(verificationResults.equipmentTypes)}
              <div>
                <div className="font-medium">Equipment Types</div>
                <div className="text-sm text-gray-500">
                  {data.equipmentTypes.length} types configured
                </div>
              </div>
            </div>
            {getStatusBadge(verificationResults.equipmentTypes)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(verificationResults.storageLocations)}
              <div>
                <div className="font-medium">Storage Locations</div>
                <div className="text-sm text-gray-500">
                  {data.storageLocations.length} locations configured
                </div>
              </div>
            </div>
            {getStatusBadge(verificationResults.storageLocations)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(verificationResults.realTimeConnection)}
              <div>
                <div className="font-medium">Real-time Connection</div>
                <div className="text-sm text-gray-500">
                  Last sync: {lastSync.toLocaleTimeString()}
                </div>
              </div>
            </div>
            {getStatusBadge(verificationResults.realTimeConnection)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(verificationResults.dataConsistency)}
              <div>
                <div className="font-medium">Data Consistency</div>
                <div className="text-sm text-gray-500">
                  All references valid
                </div>
              </div>
            </div>
            {getStatusBadge(verificationResults.dataConsistency)}
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Data Summary</div>
              <div className="text-sm text-gray-500">
                {data.equipmentItems.length} equipment items, {data.individualEquipment.length} individual items
              </div>
            </div>
            <Button onClick={handleForceSync} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Data
            </Button>
          </div>
        </div>

        {!allSystemsGo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="font-medium text-yellow-800">Setup Recommendations:</div>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              {!verificationResults.equipmentTypes && (
                <li>• Visit Equipment Types tab to ensure all required types are configured</li>
              )}
              {!verificationResults.storageLocations && (
                <li>• Visit Storage Locations tab to add storage locations</li>
              )}
              {!verificationResults.realTimeConnection && (
                <li>• Check your internet connection for real-time updates</li>
              )}
              {!verificationResults.dataConsistency && (
                <li>• Some equipment items reference invalid types or locations</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataSetupVerifier;
