
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, X, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SaveControlBarProps {
  hasUnsavedChanges: boolean;
  unsavedCount: number;
  onSave: () => void;
  onDiscard: () => void;
  isVisible?: boolean;
}

const SaveControlBar: React.FC<SaveControlBarProps> = ({
  hasUnsavedChanges,
  unsavedCount,
  onSave,
  onDiscard,
  isVisible = true
}) => {
  if (!isVisible || !hasUnsavedChanges) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 shadow-lg border-orange-200 bg-orange-50 z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <span className="text-sm font-medium text-orange-800">
            Unsaved Changes
          </span>
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            {unsavedCount} items
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={onSave}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
          
          <Button 
            onClick={onDiscard}
            size="sm"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <X className="mr-2 h-4 w-4" />
            Discard
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SaveControlBar;
