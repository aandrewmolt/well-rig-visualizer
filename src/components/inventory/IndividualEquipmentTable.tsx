
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IndividualEquipment, InventoryData } from '@/types/inventory';

interface IndividualEquipmentTableProps {
  filteredEquipment: IndividualEquipment[];
  data: InventoryData;
  onStatusChange: (itemId: string, status: 'available' | 'deployed' | 'maintenance' | 'red-tagged' | 'retired') => void;
  getEquipmentTypeName: (typeId: string) => string;
  getEquipmentTypeCategory: (typeId: string) => string;
  getLocationName: (locationId: string) => string;
  getStatusColor: (status: string) => string;
  getCategoryColor: (category: string) => string;
}

const IndividualEquipmentTable: React.FC<IndividualEquipmentTableProps> = ({
  filteredEquipment,
  data,
  onStatusChange,
  getEquipmentTypeName,
  getEquipmentTypeCategory,
  getLocationName,
  getStatusColor,
  getCategoryColor,
}) => {
  if (filteredEquipment.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No individual equipment items found</p>
        <p className="text-sm">Individual equipment items are tracked with unique IDs</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Equipment ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Serial Number</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredEquipment.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.equipmentId}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{getEquipmentTypeName(item.typeId)}</TableCell>
            <TableCell>
              <Badge className={getCategoryColor(getEquipmentTypeCategory(item.typeId))}>
                {getEquipmentTypeCategory(item.typeId)}
              </Badge>
            </TableCell>
            <TableCell>{getLocationName(item.locationId)}</TableCell>
            <TableCell>
              <Select 
                value={item.status} 
                onValueChange={(value: 'available' | 'deployed' | 'maintenance' | 'red-tagged' | 'retired') => 
                  onStatusChange(item.id, value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="deployed">Deployed</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="red-tagged">Red Tagged</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>{item.serialNumber || '-'}</TableCell>
            <TableCell className="max-w-xs truncate">{item.notes || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default IndividualEquipmentTable;
