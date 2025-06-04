
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EquipmentHistoryViewerProps {
  equipmentId?: string;
  individualEquipmentId?: string;
}

const EquipmentHistoryViewer: React.FC<EquipmentHistoryViewerProps> = ({
  equipmentId,
  individualEquipmentId
}) => {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['equipment-history', equipmentId, individualEquipmentId],
    queryFn: async () => {
      let query = supabase
        .from('equipment_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (equipmentId) {
        query = query.eq('equipment_item_id', equipmentId);
      }
      if (individualEquipmentId) {
        query = query.eq('individual_equipment_id', individualEquipmentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!(equipmentId || individualEquipmentId)
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'moved': return 'bg-blue-100 text-blue-800';
      case 'created': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-yellow-100 text-yellow-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Equipment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No history recorded for this equipment</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>From Location</TableHead>
                <TableHead>To Location</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {new Date(record.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionColor(record.action)}>
                      {record.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.from_location_type && record.from_location_id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">{record.from_location_type}</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {record.to_location_type && record.to_location_id ? (
                      <span className="text-sm">{record.to_location_type}</span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{record.quantity || '-'}</TableCell>
                  <TableCell className="max-w-48 truncate">
                    {record.notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentHistoryViewer;
