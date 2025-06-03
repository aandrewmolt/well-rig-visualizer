
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [newJobWells, setNewJobWells] = useState('1');
  const [hasWellsideGauge, setHasWellsideGauge] = useState(false);

  const createJob = () => {
    if (!newJobName.trim()) {
      toast.error('Please enter a job name');
      return;
    }

    const wellCount = parseInt(newJobWells);
    if (wellCount < 0 || wellCount > 10) {
      toast.error('Wells must be between 0 and 10');
      return;
    }

    onCreateJob({
      name: newJobName.trim(),
      wellCount: wellCount,
      hasWellsideGauge,
    });
    
    setNewJobName('');
    setNewJobWells('1');
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
            <Label htmlFor="wellCount">Number of Wells</Label>
            <Select value={newJobWells} onValueChange={setNewJobWells}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select number of wells" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 11 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i} {i === 1 ? 'Well' : 'Wells'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
