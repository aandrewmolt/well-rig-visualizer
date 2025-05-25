
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import JobDiagram from '@/components/JobDiagram';
import JobDeletionDialog from '@/components/jobs/JobDeletionDialog';
import JobCreationDialog from '@/components/jobs/JobCreationDialog';
import JobsList from '@/components/jobs/JobsList';
import JobHeader from '@/components/jobs/JobHeader';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobStorage, StoredJob } from '@/hooks/useJobStorage';
import { useInventoryData } from '@/hooks/useInventoryData';

const CableJobs = () => {
  const navigate = useNavigate();
  const { jobs, addJob, deleteJob } = useJobStorage();
  const { data, updateEquipmentItems } = useInventoryData();
  const [selectedJob, setSelectedJob] = useState<StoredJob | null>(null);
  const [jobToDelete, setJobToDelete] = useState<StoredJob | null>(null);
  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState(false);

  const createJob = (name: string, wellCount: number, hasWellsideGauge: boolean) => {
    const newJob = addJob({
      id: Date.now().toString(),
      name,
      wellCount,
      hasWellsideGauge,
    });

    setSelectedJob(newJob);
    toast.success(`Job "${newJob.name}" created successfully!`);
  };

  const handleDeleteJob = (job: StoredJob) => {
    setJobToDelete(job);
    setIsDeletionDialogOpen(true);
  };

  const confirmDeleteJob = (returnLocationId: string) => {
    if (!jobToDelete) return;

    console.log('Starting job deletion process for:', jobToDelete.id);

    // Get deployed equipment for this job before deletion
    const deployedEquipment = data.equipmentItems.filter(
      item => item.status === 'deployed' && item.jobId === jobToDelete.id
    );

    console.log('Found deployed equipment:', deployedEquipment);

    if (deployedEquipment.length > 0) {
      // Return equipment to specified location
      const updatedItems = data.equipmentItems.filter(item => 
        !(item.status === 'deployed' && item.jobId === jobToDelete.id)
      );

      // Return quantities to available items at target location
      deployedEquipment.forEach(deployedItem => {
        const availableItem = updatedItems.find(
          item => 
            item.typeId === deployedItem.typeId && 
            item.locationId === returnLocationId && 
            item.status === 'available'
        );

        if (availableItem) {
          availableItem.quantity += deployedItem.quantity;
          availableItem.lastUpdated = new Date();
        } else {
          // Create new available item at target location
          updatedItems.push({
            id: `returned-${deployedItem.typeId}-${returnLocationId}-${Date.now()}`,
            typeId: deployedItem.typeId,
            locationId: returnLocationId,
            quantity: deployedItem.quantity,
            status: 'available',
            lastUpdated: new Date(),
          });
        }
      });

      updateEquipmentItems(updatedItems);
      console.log('Equipment returned to location:', returnLocationId);
    }
    
    // Delete job data from localStorage
    try {
      localStorage.removeItem(`job-${jobToDelete.id}`);
      console.log('Job data removed from localStorage');
    } catch (error) {
      console.error('Failed to remove job data:', error);
    }
    
    // Remove from jobs list
    deleteJob(jobToDelete.id);
    
    const locationName = data.storageLocations.find(loc => loc.id === returnLocationId)?.name || 'Unknown';
    toast.success(`Job "${jobToDelete.name}" deleted and equipment returned to ${locationName}`);
    setJobToDelete(null);
    setIsDeletionDialogOpen(false);
    
    if (selectedJob?.id === jobToDelete.id) {
      setSelectedJob(null);
    }
  };

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

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="p-6">
          <JobHeader
            job={selectedJob}
            onDeleteJob={handleDeleteJob}
            onBackToJobs={() => setSelectedJob(null)}
          />
          <JobDiagram job={selectedJob} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="mr-4 bg-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cable Job Mapper</h1>
          <p className="text-xl text-gray-600 mb-6">
            Create visual diagrams for your cable and well configurations
          </p>
          
          <JobCreationDialog onCreateJob={createJob} />
        </div>

        <JobsList
          jobs={jobs}
          onSelectJob={setSelectedJob}
          onDeleteJob={handleDeleteJob}
        />

        {/* Job Deletion Dialog */}
        {jobToDelete && (
          <JobDeletionDialog
            isOpen={isDeletionDialogOpen}
            onClose={() => {
              setIsDeletionDialogOpen(false);
              setJobToDelete(null);
            }}
            onConfirm={confirmDeleteJob}
            jobName={jobToDelete.name}
            deployedEquipment={getDeployedEquipmentForJob(jobToDelete.id)}
          />
        )}
      </div>
    </div>
  );
};

export default CableJobs;
