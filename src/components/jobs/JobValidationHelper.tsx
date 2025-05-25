
import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInventoryData } from '@/hooks/useInventoryData';

interface JobValidationHelperProps {
  jobId: string;
  equipmentUsage: {
    cables: { [key: string]: number };
    gauges: number;
    adapters: number;
    computers: number;
    satellite: number;
  };
  selectedLocationId: string;
}

const JobValidationHelper: React.FC<JobValidationHelperProps> = ({
  jobId,
  equipmentUsage,
  selectedLocationId
}) => {
  const { data } = useInventoryData();

  const validateJobEquipment = () => {
    const issues: string[] = [];
    const warnings: string[] = [];
    const successes: string[] = [];

    // Check deployed equipment consistency
    const deployedItems = data.equipmentItems.filter(
      item => item.status === 'deployed' && item.jobId === jobId
    );

    if (deployedItems.length === 0) {
      warnings.push('No equipment is currently deployed to this job');
    } else {
      successes.push(`${deployedItems.length} equipment items deployed`);
    }

    // Validate inventory levels at selected location
    const typeMapping: { [key: string]: string } = {
      '100ft': '1',
      '200ft': '2',
      '300ft': '4',
    };

    Object.entries(equipmentUsage.cables).forEach(([cableType, needed]) => {
      const typeId = typeMapping[cableType];
      if (typeId) {
        const available = data.equipmentItems
          .filter(item => item.typeId === typeId && item.locationId === selectedLocationId && item.status === 'available')
          .reduce((sum, item) => sum + item.quantity, 0);
        
        if (available < needed) {
          issues.push(`${cableType} cables: need ${needed}, have ${available}`);
        } else if (available === needed) {
          warnings.push(`${cableType} cables: exact match (no spares)`);
        } else {
          successes.push(`${cableType} cables: sufficient (${available}/${needed})`);
        }
      }
    });

    // Check other equipment
    const otherEquipment = [
      { typeId: '7', needed: equipmentUsage.gauges, name: 'Pressure Gauges' },
      { typeId: '9', needed: equipmentUsage.adapters, name: 'Y Adapters' },
      { typeId: '11', needed: equipmentUsage.computers, name: 'Company Computers' },
      { typeId: '10', needed: equipmentUsage.satellite, name: 'Satellite' },
    ];

    otherEquipment.forEach(({ typeId, needed, name }) => {
      if (needed > 0) {
        const available = data.equipmentItems
          .filter(item => item.typeId === typeId && item.locationId === selectedLocationId && item.status === 'available')
          .reduce((sum, item) => sum + item.quantity, 0);
        
        if (available < needed) {
          issues.push(`${name}: need ${needed}, have ${available}`);
        } else {
          successes.push(`${name}: sufficient (${available}/${needed})`);
        }
      }
    });

    return { issues, warnings, successes };
  };

  const { issues, warnings, successes } = validateJobEquipment();

  if (issues.length === 0 && warnings.length === 0 && successes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {issues.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-medium mb-1">Equipment Issues:</div>
            <ul className="text-sm space-y-1">
              {issues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="font-medium mb-1">Warnings:</div>
            <ul className="text-sm space-y-1">
              {warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {successes.length > 0 && issues.length === 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="font-medium mb-1">All Equipment Available:</div>
            <ul className="text-sm space-y-1">
              {successes.slice(0, 3).map((success, index) => (
                <li key={index}>• {success}</li>
              ))}
              {successes.length > 3 && <li>• ...and {successes.length - 3} more</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default JobValidationHelper;
