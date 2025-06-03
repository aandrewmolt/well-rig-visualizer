
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface JobCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateJob: (jobData: { name: string; wellCount: number; hasWellsideGauge: boolean }) => void;
}

const JobCreationDialog: React.FC<JobCreationDialogProps> = ({ 
  open, 
  onOpenChange, 
  onCreateJob 
}) => {
  const [newJobName, setNewJobName] = useState('');
  const [newJobWells, setNewJobWells] = useState(1);
  const [hasWellsideGauge, setHasWellsideGauge] = useState(false);

  const createJob = () => {
    if (!newJobName.trim()) {
      toast.error('Please enter a job name');
      return;
    }

    if (newJobWells < 1 || newJobWells > 8) {
      toast.error('Wells must be between 1 and 8');
      return;
    }

    onCreateJob({
      name: newJobName.trim(),
      wellCount: newJobWells,
      hasWellsideGauge,
    });
    
    setNewJobName('');
    setNewJobWells(1);
    setHasWellsideGauge(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
