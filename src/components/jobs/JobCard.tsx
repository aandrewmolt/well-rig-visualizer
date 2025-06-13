
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trash2 } from 'lucide-react';
import { JobDiagram } from '@/hooks/useSupabaseJobs';

interface DeployedEquipment {
  id: string;
  typeId: string;
  quantity: number;
  typeName: string;
}

interface JobCardProps {
  job: JobDiagram;
  deployedEquipment: DeployedEquipment[];
  onSelectJob: (job: JobDiagram) => void;
  onDeleteJob: (job: JobDiagram) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  deployedEquipment,
  onSelectJob,
  onDeleteJob,
}) => {
  const hasEquipment = deployedEquipment.length > 0;

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow bg-white"
      onClick={() => onSelectJob(job)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{job.name}</CardTitle>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteJob(job);
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
            <span>Created: {job.createdAt ? job.createdAt.toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={job.equipmentAllocated ? 'default' : 'secondary'}>
              {job.equipmentAllocated ? 'Equipment Allocated' : 'Draft'}
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
};

export default JobCard;
