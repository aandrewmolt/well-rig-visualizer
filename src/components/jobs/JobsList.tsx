
import React from 'react';
import { StoredJob } from '@/hooks/useJobStorage';
import { useInventoryData } from '@/hooks/useInventoryData';
import JobCard from './JobCard';
import EmptyJobsState from './EmptyJobsState';

interface JobsListProps {
  jobs: StoredJob[];
  onSelectJob: (job: StoredJob) => void;
  onDeleteJob: (job: StoredJob) => void;
}

const JobsList: React.FC<JobsListProps> = ({ jobs, onSelectJob, onDeleteJob }) => {
  const { data } = useInventoryData();

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
