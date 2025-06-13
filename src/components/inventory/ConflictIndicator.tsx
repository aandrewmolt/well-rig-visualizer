import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EquipmentConflict } from '@/hooks/useInventoryMapperSync';
import { ConflictResolver } from '@/components/InventoryMapperSync';

interface ConflictIndicatorProps {
  conflicts: EquipmentConflict[];
}

const ConflictIndicator: React.FC<ConflictIndicatorProps> = ({ conflicts }) => {
  if (conflicts.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Equipment Conflicts</DialogTitle>
        </DialogHeader>
        <ConflictResolver />
      </DialogContent>
    </Dialog>
  );
};

export default ConflictIndicator;