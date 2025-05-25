
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';

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
          <span className="text-sm font-medium">Real-time Equipment Sync</span>
          <Badge variant={isAutoSyncEnabled ? 'default' : 'secondary'}>
            {isAutoSyncEnabled ? 'ENABLED' : 'DISABLED'}
          </Badge>
        </div>
        {onToggleAutoSync && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleAutoSync(!isAutoSyncEnabled)}
          >
            {isAutoSyncEnabled ? 'Disable' : 'Enable'}
          </Button>
        )}
      </div>

      {isAutoSyncEnabled && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          🔄 Equipment automatically syncs when diagram changes
        </div>
      )}
    </>
  );
};

export default AutoSyncControls;
