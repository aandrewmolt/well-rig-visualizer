
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
  showJobs?: boolean;
}

const JobAwareLocationSelector: React.FC<JobAwareLocationSelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Select location",
  disabled = false,
  showJobs = true
}) => {
  const { data } = useInventory();

  // Fetch all jobs from Supabase
  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs-for-location-selector'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, name, created_at')
        .order('name');
      
      if (error) {
        console.error('Error fetching jobs:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: showJobs
  });

  // Get the display name for the selected value
  const getDisplayName = (selectedValue: string) => {
    // Check storage locations first
    const storageLocation = data.storageLocations.find(loc => loc.id === selectedValue);
    if (storageLocation) return storageLocation.name;
    
    // Check jobs
    const job = jobs.find(j => j.id === selectedValue);
    if (job) return job.name;
    
    return placeholder;
  };

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {value ? getDisplayName(value) : placeholder}
        </SelectValue>
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
        {showJobs && jobs.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 flex items-center gap-1 border-t mt-1 pt-2">
              <Briefcase className="h-3 w-3" />
              Job Sites ({jobs.length} active)
            </div>
            {jobs.map((job) => (
              <SelectItem key={`job-${job.id}`} value={job.id}>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3 w-3 text-blue-600" />
                  <span>{job.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    Job Site
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
