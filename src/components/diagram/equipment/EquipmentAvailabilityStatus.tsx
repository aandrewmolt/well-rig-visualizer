
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EquipmentAvailabilityStatusProps {
  availability: {
    hasIssues: boolean;
    issues: string[];
  };
  equipmentUsage?: any;
}

const EquipmentAvailabilityStatus: React.FC<EquipmentAvailabilityStatusProps> = ({
  availability,
  equipmentUsage
}) => {
  if (availability.hasIssues) {
    return (
      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-800">
            Equipment Auto-Created
          </span>
        </div>
        <div className="text-xs text-orange-700 mb-2">
          Missing equipment was automatically created to fulfill job requirements:
        </div>
        <div className="space-y-1">
          {availability.issues.map((issue, index) => (
            <div key={index} className="text-xs text-orange-700">• {issue}</div>
          ))}
        </div>
      </div>
    );
  }

  if (equipmentUsage) {
    return (
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-sm font-medium text-green-800">
          ✅ All equipment available at selected location
        </div>
      </div>
    );
  }

  return null;
};

export default EquipmentAvailabilityStatus;
