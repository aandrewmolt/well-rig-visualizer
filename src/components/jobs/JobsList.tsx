
import React from 'react';
import { WifiOff, Wifi, RefreshCw, AlertCircle } from 'lucide-react';
import { JobDiagram } from '@/hooks/useSupabaseJobs';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { useOfflineFirst } from '@/hooks/offline/useOfflineFirst';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import JobCard from './JobCard';
import EmptyJobsState from './EmptyJobsState';

interface JobsListProps {
  jobs: JobDiagram[];
  isLoading: boolean;
  onSelectJob: (job: JobDiagram) => void;
  onDeleteJob: (job: JobDiagram) => void;
}

const JobsList: React.FC<JobsListProps> = ({ jobs, isLoading, onSelectJob, onDeleteJob }) => {
  const { data } = useSupabaseInventory();
  const { 
    isOnline, 
    isSyncing, 
    sync: manualSync,
    data: offlineJobs 
  } = useOfflineFirst<JobDiagram>({ tableName: 'jobs' });

  const getDeployedEquipmentForJob = (jobId: string) => {
    return data.equipmentItems
      .filter(item => item.status === 'deployed' && item.jobId === jobId)
      .map(item => ({
        id: item.id,
        typeId: item.typeId,
        quantity: item.quantity,
        typeName: data.equipmentTypes.find(type => type.id === item.typeId)?.name || 'Unknown',
      }));
  };

  const getSyncStatusBadge = (job: any) => {
    if (job.syncStatus === 'conflict') {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Conflict
        </Badge>
      );
    }
    
    if (job.syncStatus === 'pending') {
      return (
        <Badge variant="secondary" className="gap-1">
          <WifiOff className="h-3 w-3" />
          Pending sync
        </Badge>
      );
    }
    
    if (job.cloudId || job.id) {
      return (
        <Badge variant="outline" className="gap-1 text-green-600">
          <Wifi className="h-3 w-3" />
          Synced
        </Badge>
      );
    }
    
    return null;
  };

  // Use offline jobs if available, fallback to props
  const displayJobs = offlineJobs.length > 0 ? offlineJobs : jobs;
  const pendingJobs = offlineJobs.filter(job => job.syncStatus === 'pending');
  const conflictJobs = offlineJobs.filter(job => job.syncStatus === 'conflict');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (displayJobs.length === 0) {
    return <EmptyJobsState />;
  }

  return (
    <div className="space-y-4">
      {/* Sync Status Header */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-600">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-red-600">Offline</span>
              </>
            )}
          </div>
          
          {pendingJobs.length > 0 && (
            <Badge variant="secondary">
              {pendingJobs.length} pending sync
            </Badge>
          )}
          
          {conflictJobs.length > 0 && (
            <Badge variant="destructive">
              {conflictJobs.length} conflicts
            </Badge>
          )}
        </div>
        
        {isOnline && !isSyncing && (pendingJobs.length > 0 || conflictJobs.length > 0) && (
          <Button
            variant="outline"
            size="sm"
            onClick={manualSync}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Sync Now
          </Button>
        )}
        
        {isSyncing && (
          <div className="flex items-center gap-2 text-blue-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Syncing...</span>
          </div>
        )}
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayJobs.map(job => (
          <div key={job.id || job.localId} className="relative">
            <JobCard
              job={job}
              deployedEquipment={getDeployedEquipmentForJob(job.id || job.cloudId)}
              onSelectJob={onSelectJob}
              onDeleteJob={onDeleteJob}
            />
            {/* Sync Status Badge Overlay */}
            <div className="absolute top-3 right-3">
              {getSyncStatusBadge(job)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsList;
