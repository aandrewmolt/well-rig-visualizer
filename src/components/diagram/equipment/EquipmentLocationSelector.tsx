
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';

interface EquipmentLocationSelectorProps {
  selectedLocation: string;
  setSelectedLocation: (locationId: string) => void;
}

const EquipmentLocationSelector: React.FC<EquipmentLocationSelectorProps> = ({
  selectedLocation,
  setSelectedLocation
}) => {
  const { data } = useInventoryData();

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Equipment Source Location</label>
      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
        <SelectTrigger>
          <SelectValue placeholder="Select storage location" />
        </SelectTrigger>
        <SelectContent>
          {data.storageLocations.map(location => (
            <SelectItem key={location.id} value={location.id}>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {location.name}
                {location.isDefault && <Badge variant="outline" className="text-xs">Default</Badge>}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EquipmentLocationSelector;
