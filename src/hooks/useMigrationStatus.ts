
import { useState, useEffect } from 'react';
import { useSupabaseInventory } from './useSupabaseInventory';
import { toast } from 'sonner';

interface MigrationStatus {
  isSupabaseConnected: boolean;
  dataConsistency: boolean;
  hasDefaultData: boolean;
  realTimeEnabled: boolean;
}

export const useMigrationStatus = () => {
  const { data, isLoading } = useSupabaseInventory();
  const [status, setStatus] = useState<MigrationStatus>({
    isSupabaseConnected: false,
    dataConsistency: false,
    hasDefaultData: false,
    realTimeEnabled: false
  });

  useEffect(() => {
    if (!isLoading) {
      const checkMigrationStatus = () => {
        // Check if Supabase is connected (we have data)
        const isSupabaseConnected = data.equipmentTypes.length > 0 || data.storageLocations.length > 0;
        
        // Check data consistency
        const equipmentTypesValid = data.equipmentItems.every(item => 
          data.equipmentTypes.some(type => type.id === item.typeId)
        );
        const locationsValid = data.equipmentItems.every(item =>
          data.storageLocations.some(location => location.id === item.locationId)
        );
        const dataConsistency = equipmentTypesValid && locationsValid;

        // Check for required default equipment types
        const requiredTypes = [
          'Customer Computer',
          'Starlink', 
          'ShearStream Box',
          '100ft Cable',
          '200ft Cable',
          '300ft Cable',
          '1502 Pressure Gauge',
          'Y Adapter Cable'
        ];
        const hasDefaultData = requiredTypes.every(requiredType => 
          data.equipmentTypes.some(type => type.name === requiredType)
        );

        // Real-time is enabled if we're using Supabase
        const realTimeEnabled = isSupabaseConnected;

        setStatus({
          isSupabaseConnected,
          dataConsistency,
          hasDefaultData,
          realTimeEnabled
        });

        // Show migration recommendations if needed
        if (!hasDefaultData && isSupabaseConnected) {
          console.log('Migration notice: Default equipment types need to be created');
        }
      };

      checkMigrationStatus();
    }
  }, [data, isLoading]);

  const getMigrationRecommendations = () => {
    const recommendations: string[] = [];
    
    if (!status.isSupabaseConnected) {
      recommendations.push('Connect to Supabase for persistent data storage');
    }
    if (!status.hasDefaultData) {
      recommendations.push('Create default equipment types in Settings > Equipment Types');
    }
    if (!status.dataConsistency) {
      recommendations.push('Fix data consistency issues in System tab');
    }

    return recommendations;
  };

  return {
    status,
    isLoading,
    recommendations: getMigrationRecommendations(),
    isFullyMigrated: Object.values(status).every(Boolean)
  };
};
