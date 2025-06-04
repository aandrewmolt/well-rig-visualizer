
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar } from 'lucide-react';
import { useSupabaseInventory } from '@/hooks/useSupabaseInventory';
import { toast } from 'sonner';

const EquipmentReportsExporter: React.FC = () => {
  const { data } = useSupabaseInventory();
  const [reportType, setReportType] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const generateInventoryReport = () => {
    const csvData = [
      ['Equipment Type', 'Category', 'Location', 'Quantity', 'Status', 'Job ID', 'Notes', 'Last Updated'],
      ...data.equipmentItems.map(item => {
        const type = data.equipmentTypes.find(t => t.id === item.typeId);
        const location = data.storageLocations.find(l => l.id === item.locationId);
        return [
          type?.name || 'Unknown',
          type?.category || 'Unknown',
          location?.name || 'Unknown',
          item.quantity.toString(),
          item.status,
          item.jobId || '',
          item.notes || '',
          new Date(item.lastUpdated).toLocaleDateString()
        ];
      })
    ];
    return csvData;
  };

  const generateIndividualEquipmentReport = () => {
    const csvData = [
      ['Equipment ID', 'Name', 'Type', 'Location', 'Status', 'Serial Number', 'Job ID', 'Notes'],
      ...data.individualEquipment.map(equipment => {
        const type = data.equipmentTypes.find(t => t.id === equipment.typeId);
        const location = data.storageLocations.find(l => l.id === equipment.locationId);
        return [
          equipment.equipmentId,
          equipment.name,
          type?.name || 'Unknown',
          location?.name || 'Unknown',
          equipment.status,
          equipment.serialNumber || '',
          equipment.jobId || '',
          equipment.notes || ''
        ];
      })
    ];
    return csvData;
  };

  const generateDeploymentReport = () => {
    const deployedItems = data.equipmentItems.filter(item => item.status === 'deployed');
    const deployedIndividual = data.individualEquipment.filter(eq => eq.status === 'deployed');
    
    const csvData = [
      ['Type', 'Equipment ID/Name', 'Job ID', 'Location', 'Quantity', 'Deployed Date'],
      ...deployedItems.map(item => {
        const type = data.equipmentTypes.find(t => t.id === item.typeId);
        const location = data.storageLocations.find(l => l.id === item.locationId);
        return [
          'Bulk',
          type?.name || 'Unknown',
          item.jobId || '',
          location?.name || 'Unknown',
          item.quantity.toString(),
          new Date(item.lastUpdated).toLocaleDateString()
        ];
      }),
      ...deployedIndividual.map(equipment => {
        const type = data.equipmentTypes.find(t => t.id === equipment.typeId);
        const location = data.storageLocations.find(l => l.id === equipment.locationId);
        return [
          'Individual',
          `${equipment.equipmentId} - ${equipment.name}`,
          equipment.jobId || '',
          location?.name || 'Unknown',
          '1',
          new Date(equipment.lastUpdated).toLocaleDateString()
        ];
      })
    ];
    return csvData;
  };

  const exportToCSV = (data: string[][], filename: string) => {
    const csvContent = data.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    if (!reportType) {
      toast.error('Please select a report type');
      return;
    }

    setIsExporting(true);
    try {
      let csvData: string[][];
      let filename: string;
      
      switch (reportType) {
        case 'inventory':
          csvData = generateInventoryReport();
          filename = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'individual':
          csvData = generateIndividualEquipmentReport();
          filename = `individual-equipment-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'deployments':
          csvData = generateDeploymentReport();
          filename = `deployment-report-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        default:
          throw new Error('Invalid report type');
      }

      exportToCSV(csvData, filename);
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const getReportStats = () => {
    const totalItems = data.equipmentItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalIndividual = data.individualEquipment.length;
    const deployedItems = data.equipmentItems.filter(item => item.status === 'deployed').length;
    const redTaggedItems = data.equipmentItems.filter(item => item.status === 'red-tagged').length;

    return { totalItems, totalIndividual, deployedItems, redTaggedItems };
  };

  const stats = getReportStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Equipment Reports & Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
            <div className="text-sm text-gray-500">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalIndividual}</div>
            <div className="text-sm text-gray-500">Individual Equipment</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.deployedItems}</div>
            <div className="text-sm text-gray-500">Deployed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.redTaggedItems}</div>
            <div className="text-sm text-gray-500">Red Tagged</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inventory">Complete Inventory Report</SelectItem>
                <SelectItem value="individual">Individual Equipment Report</SelectItem>
                <SelectItem value="deployments">Current Deployments Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleExport} 
            disabled={!reportType || isExporting}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export to CSV'}
          </Button>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Quick Stats by Category
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(
              data.equipmentTypes.reduce((acc, type) => {
                acc[type.category] = (acc[type.category] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {category}
                </Badge>
                <span className="text-sm font-medium">{count} types</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentReportsExporter;
