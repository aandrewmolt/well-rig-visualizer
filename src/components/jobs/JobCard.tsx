
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trash2 } from 'lucide-react';
import { StoredJob } from '@/hooks/useJobStorage';

interface DeployedEquipment {
  id: string;
  typeId: string;
  quantity: number;
  typeName: string;
}

interface JobCardProps {
  job: StoredJob;
  deployedEquipment: DeployedEquipment[];
  onSelectJob: (job: StoredJob) => void;
  onDeleteJob: (job: StoredJob) => void;
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
};

export default JobCard;
