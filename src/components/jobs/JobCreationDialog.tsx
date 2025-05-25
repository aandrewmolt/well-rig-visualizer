
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface JobCreationDialogProps {
  onCreateJob: (name: string, wellCount: number, hasWellsideGauge: boolean) => void;
}

const JobCreationDialog: React.FC<JobCreationDialogProps> = ({ onCreateJob }) => {
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

    onCreateJob(newJobName.trim(), newJobWells, hasWellsideGauge);
    
    setNewJobName('');
    setNewJobWells(1);
    setHasWellsideGauge(false);
    setIsDialogOpen(false);
  };

  return (
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
  );
};

export default JobCreationDialog;
