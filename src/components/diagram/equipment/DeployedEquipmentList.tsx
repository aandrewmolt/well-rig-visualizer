
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useJobStorage } from '@/hooks/useJobStorage';
import { Briefcase, MapPin } from 'lucide-react';

interface DeployedEquipmentListProps {
  jobId: string;
}

const DeployedEquipmentList: React.FC<DeployedEquipmentListProps> = ({ jobId }) => {
  const { data } = useInventoryData();
  const { jobs } = useJobStorage();

  const getEquipmentTypeName = (typeId: string) => {
    return data.equipmentTypes.find(type => type.id === typeId)?.name || 'Unknown';
  };

  const getLocationName = (locationId: string) => {
    return data.storageLocations.find(loc => loc.id === locationId)?.name || 'Unknown';
  };

  const getJobName = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.name : `Job ${jobId}`;
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
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span className="font-medium text-blue-700">Job: {getJobName(jobId)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>From: {getLocationName(item.locationId)}</span>
                  </div>
                  <div className="text-gray-500">
                    Deployed: {new Date(item.lastUpdated).toLocaleDateString()}
                  </div>
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
