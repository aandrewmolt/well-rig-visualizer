
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2 } from 'lucide-react';

interface EquipmentTableProps {
  filteredEquipment: any[];
  data: any;
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
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No equipment found matching your filters.</p>
        <Button variant="outline" onClick={onClearFilters}>
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
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEquipment.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {getEquipmentTypeName(item.typeId)}
              </TableCell>
              <TableCell>
                <Badge className={getCategoryColor(getEquipmentTypeCategory(item.typeId))}>
                  {getEquipmentTypeCategory(item.typeId)}
                </Badge>
              </TableCell>
              <TableCell>{getLocationName(item.locationId)}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>
                <Select
                  value={item.status}
                  onValueChange={(value) => onStatusChange(item.id, value as 'available' | 'deployed' | 'red-tagged')}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="deployed">Deployed</SelectItem>
                    <SelectItem value="red-tagged">Red Tagged</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {item.notes || '-'}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(item)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
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
