
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import JobDiagram from '@/components/JobDiagram';
import { toast } from 'sonner';
import { Plus, FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Job {
  id: string;
  name: string;
  wellCount: number;
  hasWellsideGauge: boolean;
  createdAt: Date;
}

const CableJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [newJobName, setNewJobName] = useState('');
  const [newJobWells, setNewJobWells] = useState(1);
  const [hasWellsideGauge, setHasWellsideGauge] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createJob = () => {
    if (!newJobName.trim()) {
      toast.error('Please enter a job name');
      return;
    }

    if (newJobWells < 1 || newJobWells > 8) {
      toast.error('Wells must be between 1 and 8');
      return;
    }

    const newJob: Job = {
      id: Date.now().toString(),
      name: newJobName.trim(),
      wellCount: newJobWells,
      hasWellsideGauge,
      createdAt: new Date()
    };

    setJobs(prev => [...prev, newJob]);
    setNewJobName('');
    setNewJobWells(1);
    setHasWellsideGauge(false);
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
    </div>
  );
};

export default CableJobs;
