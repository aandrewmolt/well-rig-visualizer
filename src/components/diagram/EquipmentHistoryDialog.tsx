
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, FileText } from 'lucide-react';
import { useTrackedEquipment } from '@/hooks/useTrackedEquipment';
import { TrackedEquipment } from '@/types/equipment';

interface EquipmentHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: TrackedEquipment | null;
}

const EquipmentHistoryDialog: React.FC<EquipmentHistoryDialogProps> = ({
  isOpen,
  onClose,
  equipment
}) => {
  const { getEquipmentHistory } = useTrackedEquipment();
  
  if (!equipment) return null;
  
  const history = getEquipmentHistory(equipment.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Equipment History - {equipment.equipmentId}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Equipment Details */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Equipment ID</p>
                  <p className="font-semibold">{equipment.equipmentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="font-semibold">{equipment.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Type</p>
                  <Badge variant="outline">
                    {equipment.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge variant={
                    equipment.status === 'available' ? 'default' :
                    equipment.status === 'deployed' ? 'secondary' : 'destructive'
                  }>
                    {equipment.status}
                  </Badge>
                </div>
                {equipment.serialNumber && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Serial Number</p>
                    <p className="font-semibold">{equipment.serialNumber}</p>
                  </div>
                )}
                {equipment.currentJobId && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Job</p>
                    <p className="font-semibold">{equipment.currentJobId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deployment History */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Deployment History</h3>
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 mb-2" />
                <p>No deployment history found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map(deployment => (
                  <Card key={deployment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{deployment.jobName}</h4>
                          <p className="text-sm text-gray-600">Job ID: {deployment.jobId}</p>
                        </div>
                        <Badge variant={deployment.returnDate ? 'default' : 'secondary'}>
                          {deployment.returnDate ? 'Completed' : 'Active'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>Deployed: {deployment.deploymentDate.toLocaleDateString()}</span>
                        </div>
                        {deployment.returnDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Returned: {deployment.returnDate.toLocaleDateString()}</span>
                          </div>
                        )}
                        {deployment.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>Location: {deployment.location}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Custom Name: </span>
                          <span>{deployment.customNameUsed}</span>
                        </div>
                      </div>
                      
                      {deployment.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                          <strong>Notes:</strong> {deployment.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentHistoryDialog;
