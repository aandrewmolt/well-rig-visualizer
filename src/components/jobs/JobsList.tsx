
import React from 'react';
import { JobDiagram } from '@/hooks/useSupabaseJobs';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
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

  if (jobs.length === 0) {
    return <EmptyJobsState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map(job => (
        <JobCard
          key={job.id}
          job={job}
          deployedEquipment={getDeployedEquipmentForJob(job.id)}
          onSelectJob={onSelectJob}
          onDeleteJob={onDeleteJob}
        />
      ))}
    </div>
  );
};

export default JobsList;
