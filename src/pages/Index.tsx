
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import JobDiagram from '@/components/JobDiagram';
import JobCreationDialog from '@/components/jobs/JobCreationDialog';
import { JobDiagram as JobDiagramType } from '@/hooks/useSupabaseJobs';
import { toast } from 'sonner';
import { Plus, FileText } from 'lucide-react';

const Index = () => {
  const [jobs, setJobs] = useState<JobDiagramType[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobDiagramType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateJob = (jobData: { name: string; wellCount: number; hasWellsideGauge: boolean }) => {
    if (jobData.wellCount < 0 || jobData.wellCount > 10) {
      toast.error('Wells must be between 0 and 10');
      return;
    }

    const newJob: JobDiagramType = {
      id: Date.now().toString(),
      name: jobData.name,
      wellCount: jobData.wellCount,
      hasWellsideGauge: jobData.hasWellsideGauge,
      createdAt: new Date(),
      updatedAt: new Date(),
      nodes: [],
      edges: [],
      companyComputerNames: {},
      equipmentAssignment: {},
      equipmentAllocated: false,
      mainBoxName: 'ShearStream Box',
      satelliteName: 'Starlink',
      wellsideGaugeName: 'Wellside Gauge',
      selectedCableType: 'defaultCableType'
    };

    setJobs(prev => [...prev, newJob]);
    setIsDialogOpen(false);
    setSelectedJob(newJob);
    toast.success(`Job "${newJob.name}" created successfully!`);
  };

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedJob.name}</h1>
              <p className="text-gray-600">Wells: {selectedJob.wellCount} {selectedJob.hasWellsideGauge && '| Wellside Gauge: Yes'}</p>
            </div>
            <Button 
              onClick={() => setSelectedJob(null)}
              variant="outline"
              className="bg-white"
            >
              Back to Jobs
            </Button>
          </div>
          <JobDiagram job={selectedJob} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cable Job Mapper</h1>
          <p className="text-xl text-gray-600 mb-6">
            Create visual diagrams for your cable and well configurations
          </p>
          
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-5 w-5" />
            Create New Job
          </Button>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No jobs yet</h3>
            <p className="text-gray-500">Create your first job to start mapping cable connections</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <Card 
                key={job.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow bg-white"
                onClick={() => setSelectedJob(job)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{job.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Wells: {job.wellCount}</p>
                    {job.hasWellsideGauge && <p>Wellside Gauge: Yes</p>}
                    <p>Created: {job.createdAt.toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <JobCreationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreateJob={handleCreateJob}
      />
    </div>
  );
};

export default Index;
