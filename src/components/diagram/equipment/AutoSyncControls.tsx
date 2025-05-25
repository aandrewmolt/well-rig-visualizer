
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, AlertTriangle } from 'lucide-react';

interface AutoSyncControlsProps {
  isAutoSyncEnabled: boolean;
  onToggleAutoSync?: (enabled: boolean) => void;
}

const AutoSyncControls: React.FC<AutoSyncControlsProps> = ({
  isAutoSyncEnabled,
  onToggleAutoSync
}) => {
  return (
    <>
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">Equipment Sync Mode</span>
          <Badge variant={isAutoSyncEnabled ? 'default' : 'secondary'}>
            {isAutoSyncEnabled ? 'AUTO' : 'MANUAL'}
          </Badge>
        </div>
        {onToggleAutoSync && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleAutoSync(!isAutoSyncEnabled)}
          >
            {isAutoSyncEnabled ? 'Switch to Manual' : 'Switch to Auto'}
          </Button>
        )}
      </div>

      {!isAutoSyncEnabled && (
        <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
          ✓ Manual mode active - Equipment will only be allocated when you click "Auto Allocate Equipment"
        </div>
      )}

      {isAutoSyncEnabled && (
        <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Auto mode - Equipment automatically syncs when diagram changes (use with caution)
        </div>
      )}
    </>
  );
};

export default AutoSyncControls;
