import React from 'react';
import { Plus, WifiOff, Cloud, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useOfflineFirst } from '../../hooks/offline/useOfflineFirst';
import { Job } from '../../lib/types';
import { formatDistanceToNow } from 'date-fns';

/**
 * Example of migrating JobList component to offline-first
 * This replaces the existing JobList with offline capabilities
 */
export function OfflineJobList() {
  const {
    data: jobs,
    isOnline,
    isSyncing,
    create,
    update,
    remove,
    sync
  } = useOfflineFirst<Job>({ tableName: 'jobs' });
  
  const handleCreateJob = async () => {
    const newJob = {
      name: `New Job ${new Date().toLocaleTimeString()}`,
      well_count: 1,
      nodes: [],
      edges: [],
      equipment_allocations: {},
      created_at: new Date().toISOString()
    };
    
    await create(newJob);
  };
  
  const handleUpdateJob = async (job: Job) => {
    await update(job.id, {
      name: job.name + ' (edited)',
      updated_at: new Date().toISOString()
    });
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
    
    if (job.cloudId) {
      return (
        <Badge variant="outline" className="gap-1 text-green-600">
          <Cloud className="h-3 w-3" />
          Synced
        </Badge>
      );
    }
    
    return null;
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Jobs</h2>
          <p className="text-sm text-gray-500">
            {isOnline ? 'Connected' : 'Working offline'} • {jobs.length} jobs
          </p>
        </div>
        
        <div className="flex gap-2">
          {!isOnline && (
            <Badge variant="outline" className="gap-1">
              <WifiOff className="h-4 w-4" />
              Offline Mode
            </Badge>
          )}
          
          <Button onClick={handleCreateJob}>
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </div>
      </div>
      
      {/* Job List */}
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id || job.localId} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{job.name}</h3>
                <p className="text-sm text-gray-500">
                  {job.well_count || 0} wells • 
                  Updated {formatDistanceToNow(new Date(job.updatedAt || job.updated_at))} ago
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {getSyncStatusBadge(job)}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateJob(job)}
                >
                  Edit
                </Button>
              </div>
            </div>
            
            {/* Conflict Resolution UI */}
            {job.syncStatus === 'conflict' && (
              <div className="mt-3 p-3 bg-red-50 rounded-md">
                <p className="text-sm text-red-800 mb-2">
                  This job has conflicting changes. Choose which version to keep:
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Keep Local Version
                  </Button>
                  <Button size="sm" variant="outline">
                    Use Cloud Version
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
      
      {/* Empty State */}
      {jobs.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No jobs yet</p>
          <Button onClick={handleCreateJob}>
            Create your first job
          </Button>
        </Card>
      )}
      
      {/* Sync Status Footer */}
      {jobs.some(j => j.syncStatus === 'pending') && isOnline && (
        <Card className="p-4 bg-blue-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              You have unsynced changes
            </p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={sync}
              disabled={isSyncing}
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}