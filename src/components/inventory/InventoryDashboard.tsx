
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { useInventoryData } from '@/hooks/useInventoryData';

const InventoryDashboard = () => {
  const { data } = useInventoryData();

  const totalEquipment = data.equipmentItems.reduce((sum, item) => sum + item.quantity, 0);
  const availableEquipment = data.equipmentItems
    .filter(item => item.status === 'available')
    .reduce((sum, item) => sum + item.quantity, 0);
  const deployedEquipment = data.equipmentItems
    .filter(item => item.status === 'deployed')
    .reduce((sum, item) => sum + item.quantity, 0);
  const redTaggedEquipment = data.equipmentItems
    .filter(item => item.status === 'red-tagged')
    .reduce((sum, item) => sum + item.quantity, 0);

  const getEquipmentTypeName = (typeId: string) => {
    return data.equipmentTypes.find(type => type.id === typeId)?.name || 'Unknown';
  };

  const getLocationName = (locationId: string) => {
    return data.storageLocations.find(loc => loc.id === locationId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                <p className="text-2xl font-bold">{totalEquipment}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{availableEquipment}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deployed</p>
                <p className="text-2xl font-bold text-orange-600">{deployedEquipment}</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Red Tagged</p>
                <p className="text-2xl font-bold text-red-600">{redTaggedEquipment}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment by Location */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.storageLocations.map(location => {
              const locationItems = data.equipmentItems.filter(item => item.locationId === location.id);
              const locationTotal = locationItems.reduce((sum, item) => sum + item.quantity, 0);
              
              return (
                <div key={location.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{location.name}</h3>
                    {location.isDefault && <Badge variant="secondary">Default</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Total Equipment: {locationTotal}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {locationItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{getEquipmentTypeName(item.typeId)}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.quantity}</span>
                          <Badge 
                            variant={
                              item.status === 'available' ? 'default' :
                              item.status === 'deployed' ? 'secondary' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.equipmentItems
              .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
              .slice(0, 5)
              .map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 border-b">
                  <div>
                    <p className="text-sm font-medium">{getEquipmentTypeName(item.typeId)}</p>
                    <p className="text-xs text-gray-500">{getLocationName(item.locationId)}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {item.status}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDashboard;
