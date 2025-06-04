
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface DiagramControlsProps {
  onManualSave: () => void;
  onValidateEquipment: () => void;
  onValidateDiagram: () => void;
  validationResults?: any[];
  isValidating?: boolean;
}

const DiagramControls: React.FC<DiagramControlsProps> = ({
  onManualSave,
  onValidateEquipment,
  onValidateDiagram,
  validationResults = [],
  isValidating = false,
}) => {
  const handleManualSave = () => {
    onManualSave();
    toast.success('Diagram saved manually');
  };

  const hasIssues = validationResults.length > 0;
  const errorCount = validationResults.filter(r => r.severity === 'error').length;
  const warningCount = validationResults.filter(r => r.severity === 'warning').length;

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={handleManualSave}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Manual Save
          </Button>

          <Button
            onClick={onValidateEquipment}
            variant="outline"
            size="sm"
            disabled={isValidating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
            Validate Equipment
          </Button>

          <Button
            onClick={onValidateDiagram}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Validate Diagram
          </Button>

          {hasIssues && (
            <div className="flex items-center gap-2 ml-auto">
              {errorCount > 0 && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">{errorCount} errors</span>
                </div>
              )}
              {warningCount > 0 && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">{warningCount} warnings</span>
                </div>
              )}
            </div>
          )}
        </div>

        {hasIssues && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Validation Issues:</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              {validationResults.slice(0, 3).map((issue, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-yellow-600">•</span>
                  <span>{issue.description}</span>
                </li>
              ))}
              {validationResults.length > 3 && (
                <li className="text-yellow-600 font-medium">
                  ... and {validationResults.length - 3} more issues
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagramControls;
