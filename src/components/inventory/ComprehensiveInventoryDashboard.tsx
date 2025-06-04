
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  MapPin, 
  AlertTriangle, 
  TrendingUp, 
  Settings,
  Plus,
  List,
  BarChart3
} from 'lucide-react';
import { useInventory } from '@/contexts/InventoryContext';
import EquipmentLocationOverview from './EquipmentLocationOverview';

interface ComprehensiveInventoryDashboardProps {
  onSwitchToTab?: (tab: string) => void;
}

const ComprehensiveInventoryDashboard: React.FC<ComprehensiveInventoryDashboardProps> = ({ onSwitchToTab }) => {
  const { data } = useInventory();

  // Calculate comprehensive statistics
  const stats = {
    totalEquipmentTypes: data.equipmentTypes.length,
    totalBulkItems: data.equipmentItems.reduce((sum, item) => sum + item.quantity, 0),
    totalIndividualItems: data.individualEquipment.length,
    availableItems: data.equipmentItems.filter(item => item.status === 'available').reduce((sum, item) => sum + item.quantity, 0) +
                   data.individualEquipment.filter(eq => eq.status === 'available').length,
    deployedItems: data.equipmentItems.filter(item => item.status === 'deployed').reduce((sum, item) => sum + item.quantity, 0) +
                  data.individualEquipment.filter(eq => eq.status === 'deployed').length,
    redTaggedItems: data.equipmentItems.filter(item => item.status === 'red-tagged').reduce((sum, item) => sum + item.quantity, 0) +
                   data.individualEquipment.filter(eq => eq.status === 'red-tagged').length,
    storageLocations: data.storageLocations.length
  };

  // Calculate by category
  const categoryBreakdown = data.equipmentTypes.reduce((acc, type) => {
    const category = type.category;
    if (!acc[category]) {
      acc[category] = {
        types: 0,
        totalQuantity: 0,
        available: 0,
        deployed: 0,
        redTagged: 0
      };
    }
    
    acc[category].types++;
    
    const bulkItems = data.equipmentItems.filter(item => item.typeId === type.id);
    const individualItems = data.individualEquipment.filter(eq => eq.typeId === type.id);
    
    bulkItems.forEach(item => {
      acc[category].totalQuantity += item.quantity;
      if (item.status === 'available') acc[category].available += item.quantity;
      if (item.status === 'deployed') acc[category].deployed += item.quantity;
      if (item.status === 'red-tagged') acc[category].redTagged += item.quantity;
    });
    
    individualItems.forEach(eq => {
      acc[category].totalQuantity += 1;
      if (eq.status === 'available') acc[category].available += 1;
      if (eq.status === 'deployed') acc[category].deployed += 1;
      if (eq.status === 'red-tagged') acc[category].redTagged += 1;
    });
    
    return acc;
  }, {} as Record<string, any>);

  // Location breakdown (including jobs)
  const locationBreakdown = data.storageLocations.map(location => {
    const bulkItems = data.equipmentItems.filter(item => item.locationId === location.id);
    const individualItems = data.individualEquipment.filter(eq => eq.locationId === location.id);
    
    return {
      ...location,
      itemCount: bulkItems.reduce((sum, item) => sum + item.quantity, 0) + individualItems.length,
      equipmentTypes: [...new Set([
        ...bulkItems.map(item => data.equipmentTypes.find(t => t.id === item.typeId)?.name),
        ...individualItems.map(eq => data.equipmentTypes.find(t => t.id === eq.typeId)?.name)
      ])].filter(Boolean)
    };
  });

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
      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalBulkItems + stats.totalIndividualItems}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-3xl font-bold text-green-600">{stats.availableItems}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deployed</p>
                <p className="text-3xl font-bold text-blue-600">{stats.deployedItems}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Red Tagged</p>
                <p className="text-3xl font-bold text-red-600">{stats.redTaggedItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => onSwitchToTab?.('equipment-types')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment Type
            </Button>
            <Button onClick={() => onSwitchToTab?.('equipment-list')}>
              <Package className="mr-2 h-4 w-4" />
              Add Equipment Items
            </Button>
            <Button onClick={() => onSwitchToTab?.('locations')}>
              <MapPin className="mr-2 h-4 w-4" />
              Manage Locations
            </Button>
            <Button onClick={() => onSwitchToTab?.('transfers')}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Transfer Equipment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Location Overview - NEW */}
      <EquipmentLocationOverview />

      {/* Equipment by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryBreakdown).map(([category, stats]) => (
              <div key={category} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={getCategoryColor(category)}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Badge>
                  <span className="text-2xl font-bold">{stats.totalQuantity}</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Types:</span>
                    <span>{stats.types}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available:</span>
                    <span className="text-green-600">{stats.available}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deployed:</span>
                    <span className="text-blue-600">{stats.deployed}</span>
                  </div>
                  {stats.redTagged > 0 && (
                    <div className="flex justify-between">
                      <span>Red Tagged:</span>
                      <span className="text-red-600">{stats.redTagged}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locationBreakdown.map((location) => (
              <div key={location.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {location.name}
                    {location.isDefault && (
                      <Badge variant="outline" className="text-xs">Default</Badge>
                    )}
                  </h4>
                  <span className="text-lg font-bold">{location.itemCount}</span>
                </div>
                {location.address && (
                  <p className="text-xs text-gray-500 mb-2">{location.address}</p>
                )}
                <div className="text-xs text-gray-600">
                  Equipment: {location.equipmentTypes.slice(0, 3).join(', ')}
                  {location.equipmentTypes.length > 3 && ` +${location.equipmentTypes.length - 3} more`}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveInventoryDashboard;
