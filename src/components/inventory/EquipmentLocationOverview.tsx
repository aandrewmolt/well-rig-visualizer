
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Package, AlertTriangle } from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LocationData {
  locationId: string;
  locationName: string;
  isJob: boolean;
  equipment: any[];
  totalItems: number;
  available: number;
  deployed: number;
  redTagged: number;
}

const EquipmentLocationOverview = () => {
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

  // Helper function to get location name (storage or job)
  const getLocationName = (locationId: string, locationType?: string) => {
    if (locationType === 'job' || jobs.find(j => j.id === locationId)) {
      const job = jobs.find(j => j.id === locationId);
      return job ? `${job.name} (Job)` : 'Unknown Job';
    }
    
    const location = data.storageLocations.find(l => l.id === locationId);
    return location ? location.name : 'Unknown Location';
  };

  // Calculate equipment by location
  const equipmentByLocation: { [key: string]: LocationData } = {};

  // Process bulk equipment items
  data.equipmentItems.forEach(item => {
    const locationKey = `${item.locationId}-${item.locationId}`;
    const locationName = getLocationName(item.locationId, item.locationId);
    const equipmentType = data.equipmentTypes.find(t => t.id === item.typeId);
    
    if (!equipmentByLocation[locationKey]) {
      equipmentByLocation[locationKey] = {
        locationId: item.locationId,
        locationName,
        isJob: jobs.some(j => j.id === item.locationId),
        equipment: [],
        totalItems: 0,
        available: 0,
        deployed: 0,
        redTagged: 0
      };
    }
    
    equipmentByLocation[locationKey].equipment.push({
      type: 'bulk',
      name: equipmentType?.name || 'Unknown Type',
      category: equipmentType?.category || 'other',
      quantity: item.quantity,
      status: item.status,
      notes: item.notes
    });
    
    equipmentByLocation[locationKey].totalItems += item.quantity;
    
    if (item.status === 'available') equipmentByLocation[locationKey].available += item.quantity;
    if (item.status === 'deployed') equipmentByLocation[locationKey].deployed += item.quantity;
    if (item.status === 'red-tagged') equipmentByLocation[locationKey].redTagged += item.quantity;
  });

  // Process individual equipment
  data.individualEquipment.forEach(eq => {
    const locationKey = `${eq.locationId}-${eq.locationId}`;
    const locationName = getLocationName(eq.locationId, eq.locationId);
    const equipmentType = data.equipmentTypes.find(t => t.id === eq.typeId);
    
    if (!equipmentByLocation[locationKey]) {
      equipmentByLocation[locationKey] = {
        locationId: eq.locationId,
        locationName,
        isJob: jobs.some(j => j.id === eq.locationId),
        equipment: [],
        totalItems: 0,
        available: 0,
        deployed: 0,
        redTagged: 0
      };
    }
    
    equipmentByLocation[locationKey].equipment.push({
      type: 'individual',
      name: eq.name || equipmentType?.name || 'Unknown Equipment',
      category: equipmentType?.category || 'other',
      equipmentId: eq.equipmentId,
      status: eq.status,
      notes: eq.notes
    });
    
    equipmentByLocation[locationKey].totalItems += 1;
    
    if (eq.status === 'available') equipmentByLocation[locationKey].available += 1;
    if (eq.status === 'deployed') equipmentByLocation[locationKey].deployed += 1;
    if (eq.status === 'red-tagged') equipmentByLocation[locationKey].redTagged += 1;
  });

  const locations = Object.values(equipmentByLocation);

  const getCategoryColor = (category: string) => {
    const colors = {
      cables: 'bg-blue-100 text-blue-800',
      gauges: 'bg-green-100 text-green-800',
      adapters: 'bg-yellow-100 text-yellow-800',
      communication: 'bg-purple-100 text-purple-800',
      power: 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Equipment Location Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {locations.map((location) => (
              <Card key={`${location.locationId}-${location.locationName}`} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {location.isJob ? (
                        <Briefcase className="h-4 w-4 text-blue-600" />
                      ) : (
                        <MapPin className="h-4 w-4 text-gray-600" />
                      )}
                      <h4 className="font-semibold">{location.locationName}</h4>
                    </div>
                    <Badge variant="outline">
                      {location.totalItems} items
                    </Badge>
                  </div>
                  
                  {/* Status Summary */}
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline" className="text-green-600">
                      {location.available} Available
                    </Badge>
                    <Badge variant="outline" className="text-blue-600">
                      {location.deployed} Deployed
                    </Badge>
                    {location.redTagged > 0 && (
                      <Badge variant="outline" className="text-red-600">
                        {location.redTagged} Red Tagged
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {location.equipment.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{item.name}</span>
                            <Badge className={getCategoryColor(item.category)} variant="secondary">
                              {item.category}
                            </Badge>
                            {item.type === 'individual' && (
                              <Badge variant="outline" className="text-xs">
                                {item.equipmentId}
                              </Badge>
                            )}
                          </div>
                          {item.notes && (
                            <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {item.type === 'bulk' && (
                            <span className="text-sm font-medium">×{item.quantity}</span>
                          )}
                          <Badge variant={
                            item.status === 'available' ? 'default' :
                            item.status === 'deployed' ? 'secondary' :
                            item.status === 'red-tagged' ? 'destructive' : 'outline'
                          }>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {locations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="mx-auto h-8 w-8 mb-2" />
              <p>No equipment found in any locations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentLocationOverview;
