
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface JobAwareLocationSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const JobAwareLocationSelector: React.FC<JobAwareLocationSelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Select location",
  disabled = false
}) => {
  const { data } = useInventory();

  // Fetch jobs from Supabase
  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching jobs:', error);
        return [];
      }
      
      return data || [];
    }
  });

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {/* Storage Locations */}
        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Storage Locations
        </div>
        {data.storageLocations.map((location) => (
          <SelectItem key={`storage-${location.id}`} value={location.id}>
            <div className="flex items-center justify-between w-full">
              <span>{location.name}</span>
              {location.isDefault && (
                <Badge variant="outline" className="text-xs ml-2">
                  Default
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
        
        {/* Job Locations */}
        {jobs.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 flex items-center gap-1 border-t mt-1 pt-2">
              <Briefcase className="h-3 w-3" />
              Job Sites
            </div>
            {jobs.map((job) => (
              <SelectItem key={`job-${job.id}`} value={job.id}>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3 w-3 text-blue-600" />
                  <span>{job.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    Job
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
};

export default JobAwareLocationSelector;
