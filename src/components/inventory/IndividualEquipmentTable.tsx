
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle } from 'lucide-react';
import { IndividualEquipment, InventoryData } from '@/types/inventory';
import { EquipmentConflict } from '@/hooks/useInventoryMapperSync';

interface IndividualEquipmentTableProps {
  filteredEquipment: IndividualEquipment[];
  data: InventoryData;
  onStatusChange: (itemId: string, status: 'available' | 'deployed' | 'maintenance' | 'red-tagged' | 'retired') => void;
  getEquipmentTypeName: (typeId: string) => string;
  getEquipmentTypeCategory: (typeId: string) => string;
  getLocationName: (locationId: string) => string;
  getStatusColor: (status: string) => string;
  getCategoryColor: (category: string) => string;
  conflicts?: EquipmentConflict[];
  getEquipmentStatus?: (equipmentId: string) => 'available' | 'allocated' | 'deployed' | 'unavailable';
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
  conflicts = [],
  getEquipmentStatus,
}) => {
  const getConflictForEquipment = (equipmentId: string) => {
    return conflicts.find(c => c.equipmentId === equipmentId);
  };
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
        {filteredEquipment.map((item) => {
          const conflict = getConflictForEquipment(item.equipmentId);
          const syncStatus = getEquipmentStatus ? getEquipmentStatus(item.equipmentId) : item.status;
          
          return (
            <TableRow key={item.id} className={conflict ? 'bg-red-50' : ''}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {item.equipmentId}
                  {conflict && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Double-booked:</p>
                          <p className="text-sm">Current: {conflict.currentJobName}</p>
                          <p className="text-sm">Requested: {conflict.requestedJobName}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
              <TableCell>{item.name}</TableCell>
            <TableCell>{getEquipmentTypeName(item.typeId)}</TableCell>
            <TableCell>
              <Badge className={getCategoryColor(getEquipmentTypeCategory(item.typeId))}>
                {getEquipmentTypeCategory(item.typeId)}
              </Badge>
            </TableCell>
            <TableCell>{getLocationName(item.locationId)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Select 
                  value={syncStatus === 'unavailable' ? 'red-tagged' : syncStatus} 
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
                {item.jobId && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="text-xs">
                          Job #{item.jobId}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Assigned to job</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </TableCell>
            <TableCell>{item.serialNumber || '-'}</TableCell>
            <TableCell className="max-w-xs truncate">{item.notes || '-'}</TableCell>
          </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default IndividualEquipmentTable;
