
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useInventoryData } from '@/hooks/useInventoryData';

interface DeployedEquipmentListProps {
  jobId: string;
}

const DeployedEquipmentList: React.FC<DeployedEquipmentListProps> = ({ jobId }) => {
  const { data } = useInventoryData();

  const getEquipmentTypeName = (typeId: string) => {
    return data.equipmentTypes.find(type => type.id === typeId)?.name || 'Unknown';
  };

  const getLocationName = (locationId: string) => {
    return data.storageLocations.find(loc => loc.id === locationId)?.name || 'Unknown';
  };

  const getDeployedEquipment = () => {
    return data.equipmentItems.filter(item => item.status === 'deployed' && item.jobId === jobId);
  };

  const deployedEquipment = getDeployedEquipment();

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Equipment Deployed to Job</h4>
      {deployedEquipment.length === 0 ? (
        <p className="text-sm text-gray-500">No equipment currently deployed</p>
      ) : (
        <div className="space-y-2">
          {deployedEquipment.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{getEquipmentTypeName(item.typeId)}</span>
                  <Badge variant="outline">{item.quantity}x</Badge>
                  <Badge className="text-xs bg-green-100 text-green-800 border-green-300">
                    Active
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Source: {getLocationName(item.locationId)}</div>
                  <div>Deployed: {new Date(item.lastUpdated).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))}
          <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
            💡 Equipment is automatically returned when job is deleted
          </div>
        </div>
      )}
    </div>
  );
};

export default DeployedEquipmentList;
