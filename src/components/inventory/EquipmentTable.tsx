
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Package } from 'lucide-react';
import { EquipmentItem, InventoryData } from '@/types/inventory';

interface EquipmentTableProps {
  filteredEquipment: EquipmentItem[];
  data: InventoryData;
  onEdit: (item: any) => void;
  onDelete: (itemId: string) => void;
  onStatusChange: (itemId: string, newStatus: 'available' | 'deployed' | 'red-tagged') => void;
  getEquipmentTypeName: (typeId: string) => string;
  getEquipmentTypeCategory: (typeId: string) => string;
  getLocationName: (locationId: string) => string;
  getStatusColor: (status: string) => string;
  getCategoryColor: (category: string) => string;
  onClearFilters: () => void;
}

const EquipmentTable: React.FC<EquipmentTableProps> = ({
  filteredEquipment,
  data,
  onEdit,
  onDelete,
  onStatusChange,
  getEquipmentTypeName,
  getEquipmentTypeCategory,
  getLocationName,
  getStatusColor,
  getCategoryColor,
  onClearFilters,
}) => {
  if (filteredEquipment.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>No equipment found matching your filters</p>
        <Button onClick={onClearFilters} variant="outline" className="mt-2">
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipment Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Job ID</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEquipment.map(item => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {getEquipmentTypeName(item.typeId)}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getCategoryColor(getEquipmentTypeCategory(item.typeId))}>
                  {getEquipmentTypeCategory(item.typeId)}
                </Badge>
              </TableCell>
              <TableCell>{getLocationName(item.locationId)}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>{item.jobId || '-'}</TableCell>
              <TableCell className="max-w-32 truncate">
                {item.notes || '-'}
              </TableCell>
              <TableCell>
                {new Date(item.lastUpdated).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    onClick={() => onEdit(item)}
                    size="sm"
                    variant="outline"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => onDelete(item.id)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Select
                    value={item.status}
                    onValueChange={(value: 'available' | 'deployed' | 'red-tagged') => 
                      onStatusChange(item.id, value)
                    }
                  >
                    <SelectTrigger className="h-8 w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="deployed">Deployed</SelectItem>
                      <SelectItem value="red-tagged">Red Tagged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EquipmentTable;
