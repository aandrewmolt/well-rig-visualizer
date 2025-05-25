
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Briefcase } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useJobStorage } from '@/hooks/useJobStorage';

const JobDeploymentsSummary = () => {
  const { data } = useInventoryData();
  const { jobs } = useJobStorage();

  // Get all deployed equipment items grouped by job
  const deployedByJob = data.equipmentItems
    .filter(item => item.status === 'deployed' && item.jobId)
    .reduce((acc, item) => {
      const jobId = item.jobId!;
      if (!acc[jobId]) {
        acc[jobId] = [];
      }
      acc[jobId].push(item);
      return acc;
    }, {} as Record<string, typeof data.equipmentItems>);

  const getJobName = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.name : `Job ${jobId}`;
  };

  const getEquipmentTypeName = (typeId: string) => {
    return data.equipmentTypes.find(type => type.id === typeId)?.name || 'Unknown';
  };

  const getLocationName = (locationId: string) => {
    return data.storageLocations.find(loc => loc.id === locationId)?.name || 'Unknown';
  };

  const activeJobsWithEquipment = Object.keys(deployedByJob);

  if (activeJobsWithEquipment.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Equipment Deployments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No equipment currently deployed to jobs</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Job Equipment Deployments
          <Badge variant="outline" className="ml-auto">
            {activeJobsWithEquipment.length} Active Jobs
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeJobsWithEquipment.map(jobId => {
            const jobEquipment = deployedByJob[jobId];
            const totalPieces = jobEquipment.reduce((sum, item) => sum + item.quantity, 0);
            const uniqueTypes = new Set(jobEquipment.map(item => item.typeId)).size;
            const sourceLocations = new Set(jobEquipment.map(item => item.locationId));

            return (
              <div key={jobId} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{getJobName(jobId)}</h3>
                    <p className="text-sm text-gray-600">Job ID: {jobId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-orange-100 text-orange-800">
                      {totalPieces} pieces
                    </Badge>
                    <Badge variant="outline">
                      {uniqueTypes} types
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {jobEquipment.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {getEquipmentTypeName(item.typeId)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3" />
                          From: {getLocationName(item.locationId)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-600">{item.quantity}</div>
                        <div className="text-xs text-gray-500">units</div>
                      </div>
                    </div>
                  ))}
                </div>

                {sourceLocations.size > 1 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Source locations:</span> {
                        Array.from(sourceLocations).map(locId => getLocationName(locId)).join(', ')
                      }
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobDeploymentsSummary;
