
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import JobsList from '@/components/jobs/JobsList';
import JobCreationDialog from '@/components/jobs/JobCreationDialog';
import { useSupabaseJobs } from '@/hooks/useSupabaseJobs';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import JobDiagram from '@/components/JobDiagram';
import { DateFixButton } from '@/components/admin/DateFixButton';

const CableJobs = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  const { jobs, isLoading, saveJob, deleteJob, getJobById } = useSupabaseJobs();
  const inventoryData = useSupabaseInventory();

  const handleCreateJob = (jobData: { name: string; wellCount: number; hasWellsideGauge: boolean }) => {
    saveJob({
      ...jobData,
      nodes: [],
      edges: [],
      equipmentAllocated: false,
    });
    setShowCreateDialog(false);
  };

  const handleEditJob = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleBackToList = () => {
    setSelectedJobId(null);
  };

  const selectedJob = selectedJobId ? getJobById(selectedJobId) : null;

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <AppHeader />
        <div className="p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <Button onClick={handleBackToList} variant="outline">
                ← Back to Jobs
              </Button>
              <Button 
                onClick={() => saveJob({ ...selectedJob })}
                className="bg-green-600 hover:bg-green-700"
              >
                Save Job
              </Button>
            </div>
            <JobDiagram job={selectedJob} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppHeader />
      
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Cable Jobs</h1>
              <p className="text-gray-600">
                Create and manage cable job diagrams. All diagrams are saved and accessible to your entire team.
              </p>
            </div>
            <div className="flex gap-2">
              <DateFixButton />
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Job
              </Button>
            </div>
          </div>

          <JobsList
            jobs={jobs}
            isLoading={isLoading}
            onSelectJob={(job) => handleEditJob(job.id)}
            onDeleteJob={(job) => deleteJob(job.id)}
          />

          <JobCreationDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onCreateJob={handleCreateJob}
          />
        </div>
      </div>
    </div>
  );
};

export default CableJobs;
