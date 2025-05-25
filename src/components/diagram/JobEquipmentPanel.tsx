
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, MapPin, Plus, Minus, AlertTriangle, Camera } from 'lucide-react';
import { useInventoryData, EquipmentItem, EquipmentType, StorageLocation } from '@/hooks/useInventoryData';
import { toast } from 'sonner';

interface JobEquipmentPanelProps {
  jobId: string;
  jobName: string;
}

interface JobEquipmentAssignment {
  equipmentTypeId: string;
  quantity: number;
  sourceLocationId: string;
  status: 'assigned' | 'red-tagged';
  redTagReason?: string;
  notes?: string;
}

const JobEquipmentPanel: React.FC<JobEquipmentPanelProps> = ({ jobId, jobName }) => {
  const { data, updateEquipmentItems } = useInventoryData();
  const [selectedLocation, setSelectedLocation] = useState<string>(data.storageLocations[0]?.id || '');
  const [jobEquipment, setJobEquipment] = useState<JobEquipmentAssignment[]>([]);
  const [showRedTagModal, setShowRedTagModal] = useState<string | null>(null);

  const getAvailableEquipment = (locationId: string) => {
    return data.equipmentItems
      .filter(item => item.locationId === locationId && item.status === 'available')
      .reduce((acc, item) => {
        const existing = acc.find(eq => eq.typeId === item.typeId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          acc.push({ ...item });
        }
        return acc;
      }, [] as EquipmentItem[]);
  };

  const getEquipmentTypeName = (typeId: string) => {
    return data.equipmentTypes.find(type => type.id === typeId)?.name || 'Unknown';
  };

  const getLocationName = (locationId: string) => {
    return data.storageLocations.find(loc => loc.id === locationId)?.name || 'Unknown';
  };

  const assignEquipmentToJob = (equipmentTypeId: string, quantity: number) => {
    if (!selectedLocation) {
      toast.error('Please select a storage location');
      return;
    }

    const availableItems = getAvailableEquipment(selectedLocation);
    const availableItem = availableItems.find(item => item.typeId === equipmentTypeId);
    
    if (!availableItem || availableItem.quantity < quantity) {
      toast.error('Not enough equipment available at selected location');
      return;
    }

    // Add to job equipment
    const existingAssignment = jobEquipment.find(
      assign => assign.equipmentTypeId === equipmentTypeId && assign.sourceLocationId === selectedLocation
    );

    if (existingAssignment) {
      setJobEquipment(prev => prev.map(assign => 
        assign === existingAssignment 
          ? { ...assign, quantity: assign.quantity + quantity }
          : assign
      ));
    } else {
      setJobEquipment(prev => [...prev, {
        equipmentTypeId,
        quantity,
        sourceLocationId: selectedLocation,
        status: 'assigned'
      }]);
    }

    // Update inventory to mark as deployed
    const updatedItems = data.equipmentItems.map(item => {
      if (item.typeId === equipmentTypeId && item.locationId === selectedLocation && item.status === 'available') {
        const newQuantity = Math.max(0, item.quantity - quantity);
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean) as EquipmentItem[];

    // Add deployed equipment record
    updatedItems.push({
      id: `deployed-${Date.now()}`,
      typeId: equipmentTypeId,
      locationId: selectedLocation,
      quantity,
      status: 'deployed',
      jobId,
      lastUpdated: new Date()
    });

    updateEquipmentItems(updatedItems);
    toast.success(`${quantity}x ${getEquipmentTypeName(equipmentTypeId)} assigned to job`);
  };

  const redTagEquipment = (assignmentIndex: number, reason: string) => {
    setJobEquipment(prev => prev.map((assign, idx) => 
      idx === assignmentIndex 
        ? { ...assign, status: 'red-tagged', redTagReason: reason }
        : assign
    ));

    // Update inventory to mark as red-tagged
    const assignment = jobEquipment[assignmentIndex];
    const updatedItems = [...data.equipmentItems];
    
    updatedItems.push({
      id: `red-tagged-${Date.now()}`,
      typeId: assignment.equipmentTypeId,
      locationId: assignment.sourceLocationId,
      quantity: assignment.quantity,
      status: 'red-tagged',
      jobId,
      redTagReason: reason,
      lastUpdated: new Date()
    });

    updateEquipmentItems(updatedItems);
    toast.success('Equipment red-tagged successfully');
    setShowRedTagModal(null);
  };

  const returnEquipmentToStorage = (assignmentIndex: number) => {
    const assignment = jobEquipment[assignmentIndex];
    
    // Remove from job equipment
    setJobEquipment(prev => prev.filter((_, idx) => idx !== assignmentIndex));

    // Return to inventory
    const updatedItems = data.equipmentItems.map(item => {
      if (item.typeId === assignment.equipmentTypeId && 
          item.locationId === assignment.sourceLocationId && 
          item.status === 'available') {
        return { ...item, quantity: item.quantity + assignment.quantity };
      }
      return item;
    });

    // Remove deployed record
    const filteredItems = updatedItems.filter(item => 
      !(item.typeId === assignment.equipmentTypeId && 
        item.locationId === assignment.sourceLocationId && 
        item.status === 'deployed' && 
        item.jobId === jobId)
    );

    updateEquipmentItems(filteredItems);
    toast.success(`${assignment.quantity}x ${getEquipmentTypeName(assignment.equipmentTypeId)} returned to storage`);
  };

  const availableEquipment = selectedLocation ? getAvailableEquipment(selectedLocation) : [];

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5" />
          Job Equipment - {jobName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage Location Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Equipment Source Location</label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Select storage location" />
            </SelectTrigger>
            <SelectContent>
              {data.storageLocations.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {location.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Available Equipment */}
        {selectedLocation && (
          <div>
            <h4 className="text-sm font-medium mb-2">Available Equipment at {getLocationName(selectedLocation)}</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableEquipment.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getEquipmentTypeName(item.typeId)}</span>
                    <Badge variant="secondary">{item.quantity} available</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      onClick={() => assignEquipmentToJob(item.typeId, 1)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Assigned Equipment */}
        <div>
          <h4 className="text-sm font-medium mb-2">Equipment Assigned to Job</h4>
          {jobEquipment.length === 0 ? (
            <p className="text-sm text-gray-500">No equipment assigned yet</p>
          ) : (
            <div className="space-y-2">
              {jobEquipment.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{getEquipmentTypeName(assignment.equipmentTypeId)}</span>
                      <Badge variant="outline">{assignment.quantity}x</Badge>
                      <Badge 
                        variant={assignment.status === 'assigned' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {assignment.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      From: {getLocationName(assignment.sourceLocationId)}
                    </div>
                    {assignment.redTagReason && (
                      <div className="text-xs text-red-600 mt-1">
                        Red Tag Reason: {assignment.redTagReason}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {assignment.status === 'assigned' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowRedTagModal(`${index}`)}
                          className="h-7 px-2"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Red Tag
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => returnEquipmentToStorage(index)}
                          className="h-7 px-2"
                        >
                          Return
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Red Tag Modal */}
        {showRedTagModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Red Tag Equipment</h3>
              <textarea
                placeholder="Enter reason for red tagging..."
                className="w-full p-2 border rounded mb-4 h-24 resize-none"
                id="redTagReason"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const reason = (document.getElementById('redTagReason') as HTMLTextAreaElement).value;
                    if (reason.trim()) {
                      redTagEquipment(parseInt(showRedTagModal), reason);
                    } else {
                      toast.error('Please enter a reason for red tagging');
                    }
                  }}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Red Tag
                </Button>
                <Button variant="outline" onClick={() => setShowRedTagModal(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobEquipmentPanel;
