
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import JobDiagram from '@/components/JobDiagram';
import JobDeletionDialog from '@/components/jobs/JobDeletionDialog';
import { toast } from 'sonner';
import { Plus, FileText, ArrowLeft, Trash2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobStorage, StoredJob } from '@/hooks/useJobStorage';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useEnhancedEquipmentTracking } from '@/hooks/useEnhancedEquipmentTracking';
import { Badge } from '@/components/ui/badge';

const CableJobs = () => {
  const navigate = useNavigate();
  const { jobs, addJob, deleteJob } = useJobStorage();
  const { data } = useInventoryData();
  const [selectedJob, setSelectedJob] = useState<StoredJob | null>(null);
  const [newJobName, setNewJobName] = useState('');
  const [newJobWells, setNewJobWells] = useState(1);
  const [hasWellsideGauge, setHasWellsideGauge] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<StoredJob | null>(null);
  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState(false);

  const createJob = () => {
    if (!newJobName.trim()) {
      toast.error('Please enter a job name');
      return;
    }

    if (newJobWells < 1 || newJobWells > 8) {
      toast.error('Wells must be between 1 and 8');
      return;
    }

    const newJob = addJob({
      id: Date.now().toString(),
      name: newJobName.trim(),
      wellCount: newJobWells,
      hasWellsideGauge,
    });

    setNewJobName('');
    setNewJobWells(1);
    setHasWellsideGauge(false);
    setIsDialogOpen(false);
    setSelectedJob(newJob);
    toast.success(`Job "${newJob.name}" created successfully!`);
  };

  const handleDeleteJob = (job: StoredJob) => {
    setJobToDelete(job);
    setIsDeletionDialogOpen(true);
  };

  const confirmDeleteJob = (returnLocationId: string) => {
    if (!jobToDelete) return;

    // Return equipment using enhanced tracking
    const { returnEquipmentToLocation } = useEnhancedEquipmentTracking(
      jobToDelete.id, 
      [], 
      []
    );
    
    returnEquipmentToLocation(returnLocationId);
    
    // Delete job data from localStorage
    try {
      localStorage.removeItem(`job-${jobToDelete.id}`);
    } catch (error) {
      console.error('Failed to remove job data:', error);
    }
    
    // Remove from jobs list
    deleteJob(jobToDelete.id);
    
    toast.success(`Job "${jobToDelete.name}" deleted and equipment returned`);
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedJob.name}</h1>
              <p className="text-gray-600">
                Wells: {selectedJob.wellCount} 
                {selectedJob.hasWellsideGauge && ' | Wellside Gauge: Yes'}
                <Badge variant="outline" className="ml-2">
                  {selectedJob.status}
                </Badge>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => handleDeleteJob(selectedJob)}
                variant="outline"
                className="bg-red-50 text-red-600 hover:bg-red-100"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Job
              </Button>
              <Button 
                onClick={() => setSelectedJob(null)}
                variant="outline"
                className="bg-white"
              >
                Back to Jobs
              </Button>
            </div>
          </div>
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
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-5 w-5" />
                Create New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Job</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="jobName">Job Name</Label>
                  <Input
                    id="jobName"
                    value={newJobName}
                    onChange={(e) => setNewJobName(e.target.value)}
                    placeholder="Enter job name..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="wellCount">Number of Wells (1-8)</Label>
                  <Input
                    id="wellCount"
                    type="number"
                    min="1"
                    max="8"
                    value={newJobWells}
                    onChange={(e) => setNewJobWells(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wellsideGauge"
                    checked={hasWellsideGauge}
                    onCheckedChange={(checked) => setHasWellsideGauge(checked as boolean)}
                  />
                  <Label htmlFor="wellsideGauge">Include Wellside Gauge</Label>
                </div>
                <Button onClick={createJob} className="w-full">
                  Create Job
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No jobs yet</h3>
            <p className="text-gray-500">Create your first job to start mapping cable connections</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => {
              const deployedEquipment = getDeployedEquipmentForJob(job.id);
              const hasEquipment = deployedEquipment.length > 0;
              
              return (
                <Card 
                  key={job.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow bg-white"
                  onClick={() => setSelectedJob(job)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{job.name}</CardTitle>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteJob(job);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Wells: {job.wellCount}</p>
                      {job.hasWellsideGauge && <p>Wellside Gauge: Yes</p>}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Created: {job.createdAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                        {hasEquipment && (
                          <Badge variant="outline" className="text-green-600">
                            Equipment Deployed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

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
