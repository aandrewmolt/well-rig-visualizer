import React from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DebugEquipmentInfo() {
  const { data } = useInventory();
  
  // Group equipment by type
  const equipmentByType: Record<string, { bulk: number, individual: number }> = {};
  
  // Count bulk equipment
  data.equipmentItems.forEach(item => {
    if (!equipmentByType[item.typeId]) {
      equipmentByType[item.typeId] = { bulk: 0, individual: 0 };
    }
    if (item.status === 'available') {
      equipmentByType[item.typeId].bulk += item.quantity;
    }
  });
  
  // Count individual equipment
  data.individualEquipment.forEach(item => {
    if (!equipmentByType[item.typeId]) {
      equipmentByType[item.typeId] = { bulk: 0, individual: 0 };
    }
    if (item.status === 'available') {
      equipmentByType[item.typeId].individual += 1;
    }
  });
  
  // Get equipment types
  const getTypeName = (typeId: string) => {
    const type = data.equipmentTypes.find(t => t.id === typeId);
    return type?.name || 'Unknown';
  };
  
  const criticalTypes = [
    'pressure-gauge-1502',
    'customer-computer',
    'starlink',
    'y-adapter',
    '100ft-cable',
    '200ft-cable',
    '300ft-cable-new',
    'shearstream-box'
  ];
  
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Debug: Equipment Availability by Type ID</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-gray-600 mb-3">
            Showing available equipment counts by type ID:
          </div>
          {criticalTypes.map(typeId => {
            const counts = equipmentByType[typeId] || { bulk: 0, individual: 0 };
            const total = counts.bulk + counts.individual;
            const typeName = getTypeName(typeId);
            
            return (
              <div key={typeId} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{typeId}</code>
                  <span className="text-sm font-medium">{typeName}</span>
                </div>
                <div className="flex items-center gap-2">
                  {counts.bulk > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Bulk: {counts.bulk}
                    </Badge>
                  )}
                  {counts.individual > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Individual: {counts.individual}
                    </Badge>
                  )}
                  <Badge variant={total > 0 ? 'default' : 'destructive'} className="text-xs">
                    Total: {total}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Equipment must have status "available" and be in the selected location to be allocatable.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}